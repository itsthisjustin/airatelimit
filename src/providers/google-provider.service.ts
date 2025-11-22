import { Injectable, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleProviderService {
  constructor(private readonly httpService: HttpService) {}

  async chat(apiKey: string, baseUrl: string, payload: any): Promise<any> {
    try {
      // Transform OpenAI-style payload to Gemini format
      const geminiPayload = {
        contents: payload.messages.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: payload.temperature,
          topP: payload.top_p,
          maxOutputTokens: payload.max_tokens || 2048,
        },
      };

      const url = `${baseUrl}?key=${apiKey}`;
      
      const response = await firstValueFrom(
        this.httpService.post(url, geminiPayload, {
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );

      // Transform Gemini response to OpenAI format
      const candidate = response.data.candidates?.[0];
      return {
        id: `gemini-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: payload.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: candidate?.content?.parts?.[0]?.text || '',
            },
            finish_reason: candidate?.finishReason?.toLowerCase() || 'stop',
          },
        ],
        usage: {
          prompt_tokens: response.data.usageMetadata?.promptTokenCount || 0,
          completion_tokens: response.data.usageMetadata?.candidatesTokenCount || 0,
          total_tokens: response.data.usageMetadata?.totalTokenCount || 0,
        },
      };
    } catch (error) {
      console.error('Google Gemini API error:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message,
      });
      
      // Pass through Google error messages (e.g., invalid model, quota exceeded)
      const errorMessage = error.response?.data?.error?.message || 'Failed to communicate with AI service';
      const errorCode = error.response?.data?.error?.code || 'provider_error';
      
      throw new BadGatewayException({
        error: String(errorCode),
        message: errorMessage,
        provider: 'google',
      });
    }
  }

  async *chatStream(
    apiKey: string,
    baseUrl: string,
    payload: any,
  ): AsyncGenerator<any, void, unknown> {
    try {
      const geminiPayload = {
        contents: payload.messages.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        generationConfig: {
          temperature: payload.temperature,
          topP: payload.top_p,
          maxOutputTokens: payload.max_tokens || 2048,
        },
      };

      // For streaming, use streamGenerateContent endpoint
      const streamUrl = baseUrl.replace('generateContent', 'streamGenerateContent');
      const url = `${streamUrl}?key=${apiKey}`;

      const response = await firstValueFrom(
        this.httpService.post(url, geminiPayload, {
          headers: {
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
          try {
            const parsed = JSON.parse(line);
            
            // Transform Gemini streaming to OpenAI format
            if (parsed.candidates?.[0]?.content?.parts?.[0]?.text) {
              yield {
                id: `gemini-stream-${Date.now()}`,
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: payload.model,
                choices: [
                  {
                    index: 0,
                    delta: {
                      content: parsed.candidates[0].content.parts[0].text,
                    },
                    finish_reason: null,
                  },
                ],
              };
            }
            
            if (parsed.candidates?.[0]?.finishReason) {
              return;
            }
          } catch (e) {
            // Skip malformed JSON
          }
        }
      }
    } catch (error) {
      console.error('Google Gemini streaming error:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message,
      });
      
      // Pass through error messages for better debugging
      const errorMessage = error.response?.data?.error?.message || 'Failed to stream from AI service';
      const errorCode = error.response?.data?.error?.code || 'provider_error';
      
      throw new BadGatewayException({
        error: String(errorCode),
        message: errorMessage,
        provider: 'google',
      });
    }
  }
}

