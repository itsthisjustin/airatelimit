import { Injectable, Logger } from '@nestjs/common';
import { UsageService } from '../usage/usage.service';

// Flow node types
interface FlowNode {
  id: string;
  type: string; // 'start' | 'checkTier' | 'checkLimit' | 'limitResponse' | 'allow'
  position: { x: number; y: number };
  data: any;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface FlowConfig {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Request context for flow execution
export interface FlowContext {
  projectId: string;
  identity: string;
  tier?: string;
  session?: string;
  model?: string;
  // Current usage stats (fetched during execution)
  usage?: {
    requestsUsed: number;
    tokensUsed: number;
  };
}

// Result of flow execution
export interface FlowResult {
  action: 'allow' | 'block';
  response?: {
    status: number;
    body: any;
  };
  // For debugging
  executionPath?: string[];
}

@Injectable()
export class FlowExecutorService {
  private readonly logger = new Logger(FlowExecutorService.name);

  constructor(private readonly usageService: UsageService) {}

  /**
   * Execute a flow configuration against a request context
   */
  async execute(
    flowConfig: FlowConfig,
    context: FlowContext,
    upgradeUrl?: string,
  ): Promise<FlowResult> {
    const executionPath: string[] = [];

    // Build lookup maps
    const nodesById = new Map<string, FlowNode>();
    for (const node of flowConfig.nodes) {
      nodesById.set(node.id, node);
    }

    // Build edge lookup: source -> edges from that source
    const edgesBySource = new Map<string, FlowEdge[]>();
    for (const edge of flowConfig.edges) {
      const existing = edgesBySource.get(edge.source) || [];
      existing.push(edge);
      edgesBySource.set(edge.source, existing);
    }

    // Find the start node
    const startNode = flowConfig.nodes.find((n) => n.type === 'start');
    if (!startNode) {
      this.logger.warn('No start node found in flow, allowing request');
      return { action: 'allow', executionPath: ['no-start-node'] };
    }

    // Execute from start node
    let currentNode: FlowNode | undefined = startNode;
    let iterations = 0;
    const maxIterations = 50; // Prevent infinite loops

    while (currentNode && iterations < maxIterations) {
      iterations++;
      executionPath.push(`${currentNode.type}:${currentNode.id}`);

      const result = await this.evaluateNode(
        currentNode,
        context,
        upgradeUrl,
        edgesBySource,
        nodesById,
      );

      if (result.terminal) {
        // This node produces a final result
        return {
          action: result.action!,
          response: result.response,
          executionPath,
        };
      }

      // Move to next node
      currentNode = result.nextNode;
    }

    // If we exit the loop without a terminal result, allow by default
    this.logger.warn('Flow execution ended without terminal node, allowing');
    return { action: 'allow', executionPath };
  }

  /**
   * Evaluate a single node and determine next action
   */
  private async evaluateNode(
    node: FlowNode,
    context: FlowContext,
    upgradeUrl: string | undefined,
    edgesBySource: Map<string, FlowEdge[]>,
    nodesById: Map<string, FlowNode>,
  ): Promise<{
    terminal: boolean;
    action?: 'allow' | 'block';
    response?: { status: number; body: any };
    nextNode?: FlowNode;
  }> {
    switch (node.type) {
      case 'start':
        // Start node just passes through to the next connected node
        return {
          terminal: false,
          nextNode: this.getNextNode(node.id, undefined, edgesBySource, nodesById),
        };

      case 'checkTier':
        return this.evaluateCheckTier(node, context, edgesBySource, nodesById);

      case 'checkLimit':
        return this.evaluateCheckLimit(node, context, edgesBySource, nodesById);

      case 'limitResponse':
        return this.evaluateLimitResponse(node, context, upgradeUrl);

      case 'allow':
        return { terminal: true, action: 'allow' };

      default:
        this.logger.warn(`Unknown node type: ${node.type}, allowing`);
        return { terminal: true, action: 'allow' };
    }
  }

  /**
   * Evaluate checkTier node - routes based on tier value
   */
  private evaluateCheckTier(
    node: FlowNode,
    context: FlowContext,
    edgesBySource: Map<string, FlowEdge[]>,
    nodesById: Map<string, FlowNode>,
  ): { terminal: boolean; nextNode?: FlowNode } {
    const tiers: string[] = node.data?.tiers || ['free', 'pro'];
    const requestTier = context.tier || 'free';

    // Find the edge that matches the tier
    // The sourceHandle should match the tier name
    const edges = edgesBySource.get(node.id) || [];
    
    for (const edge of edges) {
      if (edge.sourceHandle === requestTier) {
        const nextNode = nodesById.get(edge.target);
        return { terminal: false, nextNode };
      }
    }

    // If no matching tier edge, try the first edge (fallback)
    if (edges.length > 0) {
      const nextNode = nodesById.get(edges[0].target);
      return { terminal: false, nextNode };
    }

    // No edges, allow by default
    return { terminal: true };
  }

  /**
   * Evaluate checkLimit node - checks usage against limits
   */
  private async evaluateCheckLimit(
    node: FlowNode,
    context: FlowContext,
    edgesBySource: Map<string, FlowEdge[]>,
    nodesById: Map<string, FlowNode>,
  ): Promise<{ terminal: boolean; nextNode?: FlowNode }> {
    const { limitType, scope, limit, period } = node.data || {};
    
    // Get current usage - we need to fetch it with the right period
    const periodStart = this.getPeriodStart(period || 'day');
    const usage = await this.usageService.getUsage({
      projectId: context.projectId,
      identity: scope === 'session' ? context.session || context.identity : context.identity,
      session: scope === 'session' ? context.session : undefined,
      periodStart,
    });

    // Check if limit is exceeded
    const currentValue = limitType === 'tokens' 
      ? usage.tokensUsed 
      : usage.requestsUsed;
    
    const isExceeded = currentValue >= (limit || Infinity);

    // Find the appropriate edge
    const edges = edgesBySource.get(node.id) || [];
    const handleToFollow = isExceeded ? 'exceeded' : 'pass';

    for (const edge of edges) {
      if (edge.sourceHandle === handleToFollow) {
        const nextNode = nodesById.get(edge.target);
        return { terminal: false, nextNode };
      }
    }

    // Fallback: if exceeded and no exceeded edge, block
    if (isExceeded) {
      return { terminal: true };
    }

    // If not exceeded and no pass edge, allow
    return { terminal: true };
  }

  /**
   * Evaluate limitResponse node - returns custom response
   */
  private evaluateLimitResponse(
    node: FlowNode,
    context: FlowContext,
    upgradeUrl?: string,
  ): {
    terminal: boolean;
    action: 'block';
    response: { status: number; body: any };
  } {
    const { message, includeUpgradeUrl } = node.data || {};

    const body: any = {
      error: 'rate_limit_exceeded',
      message: message || 'Rate limit exceeded',
    };

    // Add upgrade URL if configured
    if (includeUpgradeUrl && upgradeUrl) {
      body.upgrade_url = this.interpolateUpgradeUrl(upgradeUrl, context);
    }

    return {
      terminal: true,
      action: 'block',
      response: {
        status: 429,
        body,
      },
    };
  }

  /**
   * Get the next node following an edge
   */
  private getNextNode(
    sourceId: string,
    sourceHandle: string | undefined,
    edgesBySource: Map<string, FlowEdge[]>,
    nodesById: Map<string, FlowNode>,
  ): FlowNode | undefined {
    const edges = edgesBySource.get(sourceId) || [];
    
    // If sourceHandle specified, find matching edge
    if (sourceHandle) {
      for (const edge of edges) {
        if (edge.sourceHandle === sourceHandle) {
          return nodesById.get(edge.target);
        }
      }
    }

    // Otherwise, return first connected node
    if (edges.length > 0) {
      return nodesById.get(edges[0].target);
    }

    return undefined;
  }

  /**
   * Interpolate variables in upgrade URL
   */
  private interpolateUpgradeUrl(url: string, context: FlowContext): string {
    return url
      .replace(/\{\{identity\}\}/g, context.identity || '')
      .replace(/\{\{tier\}\}/g, context.tier || '')
      .replace(/\{\{session\}\}/g, context.session || '')
      .replace(/\{\{projectId\}\}/g, context.projectId || '');
  }

  /**
   * Check if a project has a valid flow config
   */
  hasValidFlow(flowConfig: any): boolean {
    if (!flowConfig) return false;
    if (!flowConfig.nodes || !Array.isArray(flowConfig.nodes)) return false;
    if (flowConfig.nodes.length === 0) return false;
    
    // Must have at least a start node and one other node
    const hasStart = flowConfig.nodes.some((n: any) => n.type === 'start');
    return hasStart && flowConfig.nodes.length > 1;
  }

  /**
   * Get period start date based on period type
   */
  private getPeriodStart(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'minute':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes());
      case 'hour':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours());
      case 'day':
      default:
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }
  }
}

