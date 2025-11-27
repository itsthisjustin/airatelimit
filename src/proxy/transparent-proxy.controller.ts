import {
  Controller,
  Post,
  Body,
  Headers,
  Res,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from '../projects/projects.service';
import { UsageService } from '../usage/usage.service';
import { TransparentProxyService } from './transparent-proxy.service';
import { SecurityService } from '../security/security.service';
import { AnonymizationService } from '../anonymization/anonymization.service';
import { SecurityEvent } from '../security/security-event.entity';
import { AnonymizationLog } from '../anonymization/anonymization-log.entity';
import { PricingService } from '../pricing/pricing.service';

/**
 * Transparent Proxy Controller
 *
 * This controller acts as a true transparent proxy - it accepts standard OpenAI/Anthropic
 * API requests, checks rate limits, and forwards them exactly as-is to the provider.
 *
 * The customer's API key is passed per-request (not stored in our system).
 *
 * Usage:
 * - Point your OpenAI SDK baseURL to: https://api.airatelimit.com/v1
 * - Add headers: x-project-key, x-identity, x-tier (optional)
 * - Your Authorization header with your API key is passed through
 */
@Controller('v1')
export class TransparentProxyController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly usageService: UsageService,
    private readonly transparentProxyService: TransparentProxyService,
    private readonly securityService: SecurityService,
    private readonly anonymizationService: AnonymizationService,
    private readonly pricingService: PricingService,
    @InjectRepository(SecurityEvent)
    private readonly securityEventRepository: Repository<SecurityEvent>,
    @InjectRepository(AnonymizationLog)
    private readonly anonymizationLogRepository: Repository<AnonymizationLog>,
  ) {}

  /**
   * OpenAI-compatible chat completions endpoint
   * Mirrors: POST https://api.openai.com/v1/chat/completions
   */
  @Post('chat/completions')
  async chatCompletions(
    @Headers('authorization') authorization: string,
    @Headers('x-project-key') projectKey: string,
    @Headers('x-identity') identity: string,
    @Headers('x-tier') tier: string,
    @Headers('x-session') session: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    // Validate required headers
    if (!projectKey) {
      throw new UnauthorizedException('Missing x-project-key header');
    }
    if (!authorization) {
      throw new UnauthorizedException(
        'Missing Authorization header with your API key',
      );
    }
    if (!identity) {
      throw new UnauthorizedException(
        'Missing x-identity header for rate limiting',
      );
    }

    const startTime = Date.now();
    const model = body.model || 'unknown';
    const isStreaming = body.stream === true;
    const sessionId = session || '';

    try {
      // Get project configuration
      const project = await this.projectsService.findByProjectKey(projectKey);

      // PRIVACY: Anonymize PII if enabled ("Tofu Box")
      let processedBody = body;
      if (project.anonymizationEnabled && body.messages) {
        const anonymizationResult = this.anonymizationService.anonymizeMessages(
          body.messages,
          { enabled: true, ...project.anonymizationConfig },
        );

        if (anonymizationResult.piiDetected) {
          // Log anonymization event
          await this.anonymizationLogRepository.save({
            projectId: project.id,
            identity,
            session: sessionId,
            piiTypesDetected: this.extractPiiTypes(
              body.messages,
              project.anonymizationConfig,
            ),
            replacementCount: anonymizationResult.totalReplacements,
            endpoint: 'chat/completions',
          });

          processedBody = { ...body, messages: anonymizationResult.messages };

          console.log('PII anonymized:', {
            projectId: project.id,
            identity,
            replacements: anonymizationResult.totalReplacements,
          });
        }
      }

      // SECURITY: Check for prompt injection if enabled
      if (project.securityEnabled && processedBody.messages) {
        const securityResult = this.securityService.checkMessages(
          processedBody.messages,
          project.securityCategories,
        );

        // Run advanced heuristics if enabled
        if (!securityResult.allowed || project.securityHeuristicsEnabled) {
          for (const message of processedBody.messages.filter(
            (m: any) => m.role === 'user',
          )) {
            const heuristicResult =
              this.securityService.checkAdvancedHeuristics(message.content);
            if (!heuristicResult.allowed) {
              securityResult.allowed = false;
              securityResult.reason = heuristicResult.reason;
              securityResult.pattern = heuristicResult.pattern;
              securityResult.severity = heuristicResult.severity;
              break;
            }
          }
        }

        // Log security event
        if (!securityResult.allowed) {
          await this.securityEventRepository.save({
            projectId: project.id,
            identity,
            pattern: securityResult.pattern || 'unknown',
            severity: securityResult.severity || 'medium',
            reason: securityResult.reason,
            blocked: project.securityMode === 'block',
            messagePreview: processedBody.messages
              .filter((m: any) => m.role === 'user')
              .map((m: any) => m.content?.substring(0, 100))
              .join(' | '),
          });
        }

        // Block if in block mode
        if (!securityResult.allowed && project.securityMode === 'block') {
          res.status(HttpStatus.FORBIDDEN).json({
            error: {
              message:
                securityResult.reason || 'Request blocked by security policy',
              type: 'security_policy_violation',
              code: 'security_blocked',
            },
          });
          return;
        }
      }

      // Get period start based on project's limit period
      const periodStart = this.getPeriodStart(project.limitPeriod || 'daily');

      // Estimate tokens
      const estimatedTokens = processedBody.max_tokens || 0;

      // Check and update usage (identity-based)
      const usageCheck = await this.usageService.checkAndUpdateUsage({
        project,
        identity,
        tier,
        model,
        session: sessionId,
        periodStart,
        requestedTokens: estimatedTokens,
        requestedRequests: 1,
      });

      if (!usageCheck.allowed) {
        // Track savings from blocked request
        const estimatedSavings = this.pricingService.estimateBlockedCost(model);
        await this.usageService.trackBlockedRequest({
          project,
          identity,
          model,
          session: sessionId,
          periodStart,
          estimatedSavings,
        });

        res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          error: {
            message: usageCheck.limitResponse?.message || 'Rate limit exceeded',
            type: 'rate_limit_exceeded',
            code: 'limit_exceeded',
          },
        });
        return;
      }

      // Check session limits if enabled
      if (project.sessionLimitsEnabled && sessionId) {
        const sessionCheck = await this.usageService.checkSessionLimits({
          project,
          identity,
          session: sessionId,
          tier,
          model,
          periodStart,
          requestedTokens: estimatedTokens,
          requestedRequests: 1,
        });

        if (!sessionCheck.allowed) {
          res.status(HttpStatus.TOO_MANY_REQUESTS).json({
            error: {
              message:
                sessionCheck.limitResponse?.message || 'Session limit exceeded',
              type: 'session_limit_exceeded',
              code: 'session_limit_exceeded',
            },
          });
          return;
        }
      }

      // Determine provider from model name
      const provider = this.transparentProxyService.detectProvider(model);
      const providerBaseUrl =
        this.transparentProxyService.getProviderUrl(provider);

      // Log usage check (privacy-safe)
      console.log('Transparent proxy request:', {
        projectId: project.id,
        identity,
        session: sessionId,
        tier,
        model,
        provider,
        streaming: isStreaming,
        latency: Date.now() - startTime,
      });

      if (isStreaming) {
        // Handle streaming response
        await this.handleStreamingRequest(
          res,
          authorization,
          providerBaseUrl,
          processedBody,
          project,
          identity,
          sessionId,
          model,
          periodStart,
        );
      } else {
        // Handle regular response
        const providerResponse =
          await this.transparentProxyService.forwardRequest(
            authorization,
            providerBaseUrl,
            processedBody,
          );

        // Finalize usage with actual tokens and cost
        const inputTokens = providerResponse.usage?.prompt_tokens || 0;
        const outputTokens = providerResponse.usage?.completion_tokens || 0;
        const actualTokens = providerResponse.usage?.total_tokens || 0;
        const cost = this.pricingService.calculateCost(
          model,
          inputTokens,
          outputTokens,
        );

        if (actualTokens > 0) {
          await this.usageService.finalizeUsageWithCost({
            project,
            identity,
            model,
            session: sessionId,
            periodStart,
            inputTokens,
            outputTokens,
            cost,
          });
        }

        console.log('Transparent proxy completed:', {
          projectId: project.id,
          identity,
          session: sessionId,
          tokensUsed: actualTokens,
          costUsd: cost.toFixed(6),
          latency: Date.now() - startTime,
        });

        // Return the exact provider response
        res.json(providerResponse);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      console.error('Transparent proxy error:', {
        projectKey,
        identity,
        session: sessionId,
        error: error.message,
        latency: Date.now() - startTime,
      });

      // Pass through provider errors
      if (error.response?.data) {
        res.status(error.response.status || 500).json(error.response.data);
        return;
      }

      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          type: 'proxy_error',
          code: 'internal_error',
        },
      });
    }
  }

  /**
   * OpenAI-compatible images generations endpoint
   * Mirrors: POST https://api.openai.com/v1/images/generations
   */
  @Post('images/generations')
  async imagesGenerations(
    @Headers('authorization') authorization: string,
    @Headers('x-project-key') projectKey: string,
    @Headers('x-identity') identity: string,
    @Headers('x-tier') tier: string,
    @Headers('x-session') session: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!projectKey) {
      throw new UnauthorizedException('Missing x-project-key header');
    }
    if (!authorization) {
      throw new UnauthorizedException(
        'Missing Authorization header with your API key',
      );
    }
    if (!identity) {
      throw new UnauthorizedException(
        'Missing x-identity header for rate limiting',
      );
    }

    const startTime = Date.now();
    const model = body.model || 'dall-e-3';
    const sessionId = session || '';
    const numImages = body.n || 1;

    try {
      const project = await this.projectsService.findByProjectKey(projectKey);

      // PRIVACY: Anonymize prompt if enabled
      let processedBody = body;
      if (project.anonymizationEnabled && body.prompt) {
        const anonymizationResult = this.anonymizationService.anonymizePrompt(
          body.prompt,
          { enabled: true, ...project.anonymizationConfig },
        );

        if (anonymizationResult.piiDetected) {
          await this.anonymizationLogRepository.save({
            projectId: project.id,
            identity,
            session: sessionId,
            piiTypesDetected: anonymizationResult.replacements.map(
              (r) => r.type,
            ),
            replacementCount: anonymizationResult.replacements.length,
            endpoint: 'images/generations',
          });

          processedBody = { ...body, prompt: anonymizationResult.text };
        }
      }

      const periodStart = this.getPeriodStart(project.limitPeriod || 'daily');

      // For images, count each image as a request
      const usageCheck = await this.usageService.checkAndUpdateUsage({
        project,
        identity,
        tier,
        model,
        session: sessionId,
        periodStart,
        requestedTokens: 0,
        requestedRequests: numImages,
      });

      if (!usageCheck.allowed) {
        const estimatedSavings = this.pricingService.estimateImageCost(
          model,
          body.size,
          body.quality,
        );
        await this.usageService.trackBlockedRequest({
          project,
          identity,
          model,
          session: sessionId,
          periodStart,
          estimatedSavings: estimatedSavings * numImages,
        });

        res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          error: {
            message: usageCheck.limitResponse?.message || 'Rate limit exceeded',
            type: 'rate_limit_exceeded',
            code: 'limit_exceeded',
          },
        });
        return;
      }

      // Check session limits
      if (project.sessionLimitsEnabled && sessionId) {
        const sessionCheck = await this.usageService.checkSessionLimits({
          project,
          identity,
          session: sessionId,
          tier,
          model,
          periodStart,
          requestedTokens: 0,
          requestedRequests: numImages,
        });

        if (!sessionCheck.allowed) {
          res.status(HttpStatus.TOO_MANY_REQUESTS).json({
            error: {
              message:
                sessionCheck.limitResponse?.message || 'Session limit exceeded',
              type: 'session_limit_exceeded',
              code: 'session_limit_exceeded',
            },
          });
          return;
        }
      }

      // Forward to OpenAI
      const providerResponse =
        await this.transparentProxyService.forwardRequest(
          authorization,
          'https://api.openai.com/v1/images/generations',
          processedBody,
        );

      // Track cost for images
      const cost =
        this.pricingService.estimateImageCost(model, body.size, body.quality) *
        numImages;
      await this.usageService.finalizeUsageWithCost({
        project,
        identity,
        model,
        session: sessionId,
        periodStart,
        inputTokens: 0,
        outputTokens: 0,
        cost,
      });

      console.log('Image generation completed:', {
        projectId: project.id,
        identity,
        model,
        images: numImages,
        costUsd: cost.toFixed(4),
        latency: Date.now() - startTime,
      });

      res.json(providerResponse);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error('Image generation error:', {
        projectKey,
        identity,
        error: error.message,
      });

      if (error.response?.data) {
        res.status(error.response.status || 500).json(error.response.data);
        return;
      }

      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          type: 'proxy_error',
          code: 'internal_error',
        },
      });
    }
  }

  /**
   * OpenAI-compatible embeddings endpoint
   * Mirrors: POST https://api.openai.com/v1/embeddings
   */
  @Post('embeddings')
  async embeddings(
    @Headers('authorization') authorization: string,
    @Headers('x-project-key') projectKey: string,
    @Headers('x-identity') identity: string,
    @Headers('x-tier') tier: string,
    @Headers('x-session') session: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!projectKey) {
      throw new UnauthorizedException('Missing x-project-key header');
    }
    if (!authorization) {
      throw new UnauthorizedException(
        'Missing Authorization header with your API key',
      );
    }
    if (!identity) {
      throw new UnauthorizedException(
        'Missing x-identity header for rate limiting',
      );
    }

    const startTime = Date.now();
    const model = body.model || 'text-embedding-3-small';
    const sessionId = session || '';

    try {
      const project = await this.projectsService.findByProjectKey(projectKey);

      // PRIVACY: Anonymize input if enabled
      let processedBody = body;
      if (project.anonymizationEnabled && body.input) {
        const inputText = Array.isArray(body.input)
          ? body.input.join(' ')
          : body.input;
        const anonymizationResult = this.anonymizationService.anonymizePrompt(
          inputText,
          { enabled: true, ...project.anonymizationConfig },
        );

        if (anonymizationResult.piiDetected) {
          await this.anonymizationLogRepository.save({
            projectId: project.id,
            identity,
            session: sessionId,
            piiTypesDetected: anonymizationResult.replacements.map(
              (r) => r.type,
            ),
            replacementCount: anonymizationResult.replacements.length,
            endpoint: 'embeddings',
          });

          processedBody = {
            ...body,
            input: Array.isArray(body.input)
              ? [anonymizationResult.text]
              : anonymizationResult.text,
          };
        }
      }

      const periodStart = this.getPeriodStart(project.limitPeriod || 'daily');

      // Estimate tokens for embeddings
      const inputTokens = this.estimateTokens(body.input);

      const usageCheck = await this.usageService.checkAndUpdateUsage({
        project,
        identity,
        tier,
        model,
        session: sessionId,
        periodStart,
        requestedTokens: inputTokens,
        requestedRequests: 1,
      });

      if (!usageCheck.allowed) {
        const estimatedSavings = this.pricingService.calculateEmbeddingCost(
          model,
          inputTokens,
        );
        await this.usageService.trackBlockedRequest({
          project,
          identity,
          model,
          session: sessionId,
          periodStart,
          estimatedSavings,
        });

        res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          error: {
            message: usageCheck.limitResponse?.message || 'Rate limit exceeded',
            type: 'rate_limit_exceeded',
            code: 'limit_exceeded',
          },
        });
        return;
      }

      // Check session limits
      if (project.sessionLimitsEnabled && sessionId) {
        const sessionCheck = await this.usageService.checkSessionLimits({
          project,
          identity,
          session: sessionId,
          tier,
          model,
          periodStart,
          requestedTokens: inputTokens,
          requestedRequests: 1,
        });

        if (!sessionCheck.allowed) {
          res.status(HttpStatus.TOO_MANY_REQUESTS).json({
            error: {
              message:
                sessionCheck.limitResponse?.message || 'Session limit exceeded',
              type: 'session_limit_exceeded',
              code: 'session_limit_exceeded',
            },
          });
          return;
        }
      }

      // Forward to OpenAI
      const providerResponse =
        await this.transparentProxyService.forwardRequest(
          authorization,
          'https://api.openai.com/v1/embeddings',
          processedBody,
        );

      // Track actual usage
      const actualTokens = providerResponse.usage?.total_tokens || inputTokens;
      const cost = this.pricingService.calculateEmbeddingCost(
        model,
        actualTokens,
      );

      await this.usageService.finalizeUsageWithCost({
        project,
        identity,
        model,
        session: sessionId,
        periodStart,
        inputTokens: actualTokens,
        outputTokens: 0,
        cost,
      });

      console.log('Embeddings completed:', {
        projectId: project.id,
        identity,
        model,
        tokens: actualTokens,
        costUsd: cost.toFixed(6),
        latency: Date.now() - startTime,
      });

      res.json(providerResponse);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error('Embeddings error:', {
        projectKey,
        identity,
        error: error.message,
      });

      if (error.response?.data) {
        res.status(error.response.status || 500).json(error.response.data);
        return;
      }

      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          type: 'proxy_error',
          code: 'internal_error',
        },
      });
    }
  }

  /**
   * OpenAI-compatible audio transcriptions endpoint (Whisper)
   * Mirrors: POST https://api.openai.com/v1/audio/transcriptions
   */
  @Post('audio/transcriptions')
  async audioTranscriptions(
    @Headers('authorization') authorization: string,
    @Headers('x-project-key') projectKey: string,
    @Headers('x-identity') identity: string,
    @Headers('x-tier') tier: string,
    @Headers('x-session') session: string,
    @Body() body: any,
    @Res() res: Response,
  ) {
    if (!projectKey) {
      throw new UnauthorizedException('Missing x-project-key header');
    }
    if (!authorization) {
      throw new UnauthorizedException(
        'Missing Authorization header with your API key',
      );
    }
    if (!identity) {
      throw new UnauthorizedException(
        'Missing x-identity header for rate limiting',
      );
    }

    const startTime = Date.now();
    const model = body.model || 'whisper-1';
    const sessionId = session || '';

    try {
      const project = await this.projectsService.findByProjectKey(projectKey);
      const periodStart = this.getPeriodStart(project.limitPeriod || 'daily');

      // Audio transcriptions are request-based (per file)
      const usageCheck = await this.usageService.checkAndUpdateUsage({
        project,
        identity,
        tier,
        model,
        session: sessionId,
        periodStart,
        requestedTokens: 0,
        requestedRequests: 1,
      });

      if (!usageCheck.allowed) {
        const estimatedSavings = this.pricingService.estimateAudioCost(model);
        await this.usageService.trackBlockedRequest({
          project,
          identity,
          model,
          session: sessionId,
          periodStart,
          estimatedSavings,
        });

        res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          error: {
            message: usageCheck.limitResponse?.message || 'Rate limit exceeded',
            type: 'rate_limit_exceeded',
            code: 'limit_exceeded',
          },
        });
        return;
      }

      // Check session limits
      if (project.sessionLimitsEnabled && sessionId) {
        const sessionCheck = await this.usageService.checkSessionLimits({
          project,
          identity,
          session: sessionId,
          tier,
          model,
          periodStart,
          requestedTokens: 0,
          requestedRequests: 1,
        });

        if (!sessionCheck.allowed) {
          res.status(HttpStatus.TOO_MANY_REQUESTS).json({
            error: {
              message:
                sessionCheck.limitResponse?.message || 'Session limit exceeded',
              type: 'session_limit_exceeded',
              code: 'session_limit_exceeded',
            },
          });
          return;
        }
      }

      // Forward to OpenAI (note: this endpoint typically uses multipart/form-data)
      const providerResponse =
        await this.transparentProxyService.forwardRequest(
          authorization,
          'https://api.openai.com/v1/audio/transcriptions',
          body,
        );

      // Track cost (Whisper is $0.006/minute, estimate based on typical file)
      const cost = this.pricingService.estimateAudioCost(model);
      await this.usageService.finalizeUsageWithCost({
        project,
        identity,
        model,
        session: sessionId,
        periodStart,
        inputTokens: 0,
        outputTokens: 0,
        cost,
      });

      console.log('Audio transcription completed:', {
        projectId: project.id,
        identity,
        model,
        costUsd: cost.toFixed(4),
        latency: Date.now() - startTime,
      });

      res.json(providerResponse);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      console.error('Audio transcription error:', {
        projectKey,
        identity,
        error: error.message,
      });

      if (error.response?.data) {
        res.status(error.response.status || 500).json(error.response.data);
        return;
      }

      res.status(500).json({
        error: {
          message: error.message || 'Internal server error',
          type: 'proxy_error',
          code: 'internal_error',
        },
      });
    }
  }

  /**
   * Handle streaming responses
   */
  private async handleStreamingRequest(
    res: Response,
    authorization: string,
    providerBaseUrl: string,
    body: any,
    project: any,
    identity: string,
    session: string,
    model: string,
    periodStart: Date,
  ) {
    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let inputTokens = 0;
    let outputTokens = 0;

    try {
      for await (const chunk of this.transparentProxyService.forwardStreamingRequest(
        authorization,
        providerBaseUrl,
        body,
      )) {
        // Track tokens from usage field if available
        if (chunk.usage) {
          inputTokens = chunk.usage.prompt_tokens || inputTokens;
          outputTokens = chunk.usage.completion_tokens || outputTokens;
        }

        // Forward the chunk exactly as received
        res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      }

      // Send done signal
      res.write('data: [DONE]\n\n');
      res.end();

      // Finalize usage tracking with cost
      const totalTokens = inputTokens + outputTokens;
      if (totalTokens > 0) {
        const cost = this.pricingService.calculateCost(
          model,
          inputTokens,
          outputTokens,
        );
        await this.usageService.finalizeUsageWithCost({
          project,
          identity,
          model,
          session,
          periodStart,
          inputTokens,
          outputTokens,
          cost,
        });
      }
    } catch (error) {
      console.error('Transparent proxy stream error:', {
        projectId: project.id,
        identity,
        session,
        error: error.message,
      });
      res.end();
    }
  }

  private getPeriodStart(limitPeriod: 'daily' | 'weekly' | 'monthly'): Date {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = now.getUTCMonth();
    const date = now.getUTCDate();
    const day = now.getUTCDay();

    switch (limitPeriod) {
      case 'daily':
        return new Date(Date.UTC(year, month, date));
      case 'weekly':
        const daysToMonday = (day + 6) % 7;
        return new Date(Date.UTC(year, month, date - daysToMonday));
      case 'monthly':
        return new Date(Date.UTC(year, month, 1));
      default:
        return new Date(Date.UTC(year, month, date));
    }
  }

  /**
   * Extract PII types detected from messages for logging
   */
  private extractPiiTypes(messages: any[], config: any): string[] {
    const types: Set<string> = new Set();

    for (const message of messages) {
      if (message.role !== 'user' || !message.content) continue;

      const detection = this.anonymizationService.detectPII(message.content, {
        enabled: true,
        ...config,
      });

      detection.types.forEach((t) => types.add(t));
    }

    return Array.from(types);
  }

  /**
   * Estimate tokens for embeddings input
   */
  private estimateTokens(input: string | string[]): number {
    const text = Array.isArray(input) ? input.join(' ') : input;
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }
}
