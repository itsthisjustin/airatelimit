import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProviderRouterService } from './provider-router.service';
import { OpenAIProviderService } from './openai-provider.service';
import { AnthropicProviderService } from './anthropic-provider.service';
import { GoogleProviderService } from './google-provider.service';
import { XAIProviderService } from './xai-provider.service';

@Module({
  imports: [HttpModule],
  providers: [
    ProviderRouterService,
    OpenAIProviderService,
    AnthropicProviderService,
    GoogleProviderService,
    XAIProviderService,
  ],
  exports: [ProviderRouterService],
})
export class ProvidersModule {}

