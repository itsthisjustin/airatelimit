import { Injectable } from '@nestjs/common';
import { Project } from '../projects/projects.entity';
import { ChatProxyRequestDto } from '../proxy/dto/chat-proxy-request.dto';
import { OpenAIProviderService } from './openai-provider.service';
import { AnthropicProviderService } from './anthropic-provider.service';
import { GoogleProviderService } from './google-provider.service';
import { XAIProviderService } from './xai-provider.service';
import { resolveModelProvider, ProviderType } from './model-resolver';

// Default base URLs for each provider
const DEFAULT_BASE_URLS: Record<ProviderType, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  google: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
  xai: 'https://api.x.ai/v1/chat/completions',
  other: '',
};

@Injectable()
export class ProviderRouterService {
  constructor(
    private readonly openaiProvider: OpenAIProviderService,
    private readonly anthropicProvider: AnthropicProviderService,
    private readonly googleProvider: GoogleProviderService,
    private readonly xaiProvider: XAIProviderService,
  ) {}

  /**
   * Resolves provider credentials for a given model
   * Supports both legacy single-provider and new multi-provider configurations
   */
  private resolveProviderCredentials(
    project: Project,
    model: string,
  ): { provider: ProviderType; apiKey: string; baseUrl: string } {
    // First, try to resolve provider from model name (for multi-provider support)
    const modelProvider = resolveModelProvider(model);

    // Check if we have multi-provider configuration
    if (project.providerKeys && Object.keys(project.providerKeys).length > 0) {
      // If we can detect the provider from model name, use that
      if (modelProvider && project.providerKeys[modelProvider]) {
        const config = project.providerKeys[modelProvider];
        return {
          provider: modelProvider,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl || DEFAULT_BASE_URLS[modelProvider],
        };
      }

      // If model provider unknown but we have configured providers, try them in order
      const configuredProviders = Object.keys(project.providerKeys) as ProviderType[];
      if (configuredProviders.length === 1) {
        // Only one provider configured, use it
        const provider = configuredProviders[0];
        const config = project.providerKeys[provider];
        return {
          provider,
          apiKey: config.apiKey,
          baseUrl: config.baseUrl || DEFAULT_BASE_URLS[provider],
        };
      }

      // Multiple providers configured but can't determine which to use
      throw new Error(
        `Cannot determine provider for model "${model}". Configure the model's provider or use a known model name.`
      );
    }

    // Fall back to legacy single-provider configuration
    if (project.provider && project.openaiApiKey) {
      return {
        provider: project.provider,
        apiKey: project.openaiApiKey,
        baseUrl: project.baseUrl || DEFAULT_BASE_URLS[project.provider],
      };
    }

    throw new Error(
      'Project is not configured. Please set up your AI provider and API key in the dashboard.'
    );
  }

  async forwardChat(project: Project, body: ChatProxyRequestDto): Promise<any> {
    const { provider, apiKey, baseUrl } = this.resolveProviderCredentials(project, body.model);
    const payload = this.buildPayload(body, false);

    // Route based on resolved provider
    switch (provider) {
      case 'openai':
        return this.openaiProvider.chat(apiKey, baseUrl, payload);
      case 'anthropic':
        return this.anthropicProvider.chat(apiKey, baseUrl, payload);
      case 'google':
        return this.googleProvider.chat(apiKey, baseUrl, payload);
      case 'xai':
        return this.xaiProvider.chat(apiKey, baseUrl, payload);
      case 'other':
        // Treat "other" providers as OpenAI-compatible
        return this.openaiProvider.chat(apiKey, baseUrl, payload);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  async *forwardChatStream(
    project: Project,
    body: ChatProxyRequestDto,
  ): AsyncGenerator<any, void, unknown> {
    const { provider, apiKey, baseUrl } = this.resolveProviderCredentials(project, body.model);
    const payload = this.buildPayload(body, true);

    // Route based on resolved provider
    switch (provider) {
      case 'openai':
        yield* this.openaiProvider.chatStream(apiKey, baseUrl, payload);
        return;
      case 'anthropic':
        yield* this.anthropicProvider.chatStream(apiKey, baseUrl, payload);
        return;
      case 'google':
        yield* this.googleProvider.chatStream(apiKey, baseUrl, payload);
        return;
      case 'xai':
        yield* this.xaiProvider.chatStream(apiKey, baseUrl, payload);
        return;
      case 'other':
        // Treat "other" providers as OpenAI-compatible
        yield* this.openaiProvider.chatStream(apiKey, baseUrl, payload);
        return;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  private buildPayload(body: ChatProxyRequestDto, stream: boolean): any {
    return {
      model: body.model,
      messages: body.messages,
      max_tokens: body.max_tokens,
      temperature: body.temperature ?? 0.7,
      top_p: body.top_p ?? 1,
      stream,
    };
  }
}

