import { Injectable, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AnthropicProviderService {
  constructor(private readonly httpService: HttpService) {}

  async chat(apiKey: string, baseUrl: string, payload: any): Promise<any> {
    try {
      // Transform OpenAI-style payload to Anthropic format
      const anthropicPayload = {
        model: payload.model,
        max_tokens: payload.max_tokens || 1024,
        messages: payload.messages,
        temperature: payload.temperature,
        top_p: payload.top_p,
      };

      const response = await firstValueFrom(
        this.httpService.post(baseUrl, anthropicPayload, {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }),
      );

      // Transform Anthropic response to OpenAI format
      return {
        id: response.data.id,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: response.data.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: response.data.content[0]?.text || '',
            },
            finish_reason: response.data.stop_reason,
          },
        ],
        usage: {
          prompt_tokens: response.data.usage?.input_tokens || 0,
          completion_tokens: response.data.usage?.output_tokens || 0,
          total_tokens: (response.data.usage?.input_tokens || 0) + (response.data.usage?.output_tokens || 0),
        },
      };
    } catch (error) {
      console.error('Anthropic API error:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message,
      });
      
      // Pass through Anthropic error messages (e.g., invalid model, auth errors)
      const errorMessage = error.response?.data?.error?.message || 'Failed to communicate with AI service';
      const errorType = error.response?.data?.error?.type || 'provider_error';
      
      throw new BadGatewayException({
        error: errorType,
        message: errorMessage,
        provider: 'anthropic',
      });
    }
  }

  async *chatStream(
    apiKey: string,
    baseUrl: string,
    payload: any,
  ): AsyncGenerator<any, void, unknown> {
    try {
      const anthropicPayload = {
        model: payload.model,
        max_tokens: payload.max_tokens || 1024,
        messages: payload.messages,
        temperature: payload.temperature,
        top_p: payload.top_p,
        stream: true,
      };

      const response = await firstValueFrom(
        this.httpService.post(baseUrl, anthropicPayload, {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
          responseType: 'stream',
        }),
      );

      const stream = response.data;
      
      for await (const chunk of stream) {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line: string) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            try {
              const parsed = JSON.parse(data);
              
              // Transform Anthropic streaming to OpenAI format
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                yield {
                  id: parsed.id || 'anthropic-stream',
                  object: 'chat.completion.chunk',
                  created: Math.floor(Date.now() / 1000),
                  model: payload.model,
                  choices: [
                    {
                      index: 0,
                      delta: {
                        content: parsed.delta.text,
                      },
                      finish_reason: null,
                    },
                  ],
                };
              }
              
              if (parsed.type === 'message_stop') {
                return;
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('Anthropic streaming error:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message,
      });
      
      // Pass through error messages for better debugging
      const errorMessage = error.response?.data?.error?.message || 'Failed to stream from AI service';
      const errorType = error.response?.data?.error?.type || 'provider_error';
      
      throw new BadGatewayException({
        error: errorType,
        message: errorMessage,
        provider: 'anthropic',
      });
    }
  }
}

