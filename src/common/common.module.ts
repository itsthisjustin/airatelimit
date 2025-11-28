import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CryptoService } from './crypto.service';
import { RateLimitService } from './rate-limit.service';
import { ProxyRateLimitMiddleware } from './proxy-rate-limit.middleware';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [CryptoService, RateLimitService, ProxyRateLimitMiddleware],
  exports: [CryptoService, RateLimitService, ProxyRateLimitMiddleware],
})
export class CommonModule {}
