import { Injectable, BadGatewayException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OpenAIProviderService {
  constructor(private readonly httpService: HttpService) {}

  async chat(apiKey: string, baseUrl: string, payload: any): Promise<any> {
    try {
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
      // PRIVACY: Log without exposing prompts, but pass through helpful errors
      console.error('OpenAI API error:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message,
      });
      
      // Pass through provider error message (e.g., invalid model, rate limits)
      // These errors help users fix configuration issues
      const errorMessage = error.response?.data?.error?.message || 'Failed to communicate with AI service';
      const errorCode = error.response?.data?.error?.code || 'provider_error';
      
      throw new BadGatewayException({
        error: errorCode,
        message: errorMessage,
        provider: 'openai',
      });
    }
  }

  async *chatStream(
    apiKey: string,
    baseUrl: string,
    payload: any,
  ): AsyncGenerator<any, void, unknown> {
    try {
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
      console.error('OpenAI streaming error:', {
        status: error.response?.status,
        message: error.response?.data?.error?.message,
      });
      
      // Pass through provider error message for better debugging
      const errorMessage = error.response?.data?.error?.message || 'Failed to stream from AI service';
      const errorCode = error.response?.data?.error?.code || 'provider_error';
      
      throw new BadGatewayException({
        error: errorCode,
        message: errorMessage,
        provider: 'openai',
      });
    }
  }
}

