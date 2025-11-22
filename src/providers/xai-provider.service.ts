import { Injectable, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class XAIProviderService {
  constructor(private readonly httpService: HttpService) {}

  async chat(apiKey: string, baseUrl: string, payload: any): Promise<any> {
    try {
      // xAI Grok uses OpenAI-compatible API
      const response = await firstValueFrom(
        this.httpService.post(baseUrl, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error) {
      console.error('xAI API error:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message,
      });
      
      // Pass through xAI error messages (e.g., invalid model, auth errors)
      const errorMessage = error.response?.data?.error?.message || 'Failed to communicate with AI service';
      const errorCode = error.response?.data?.error?.code || 'provider_error';
      
      throw new BadGatewayException({
        error: errorCode,
        message: errorMessage,
        provider: 'xai',
      });
    }
  }

  async *chatStream(
    apiKey: string,
    baseUrl: string,
    payload: any,
  ): AsyncGenerator<any, void, unknown> {
    try {
      // xAI Grok uses OpenAI-compatible streaming
      const response = await firstValueFrom(
        this.httpService.post(baseUrl, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
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
            if (data === '[DONE]') {
              return;
            }
            try {
              const parsed = JSON.parse(data);
              yield parsed;
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }
    } catch (error) {
      console.error('xAI streaming error:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message,
      });
      
      // Pass through error messages for better debugging
      const errorMessage = error.response?.data?.error?.message || 'Failed to stream from AI service';
      const errorCode = error.response?.data?.error?.code || 'provider_error';
      
      throw new BadGatewayException({
        error: errorCode,
        message: errorMessage,
        provider: 'xai',
      });
    }
  }
}

