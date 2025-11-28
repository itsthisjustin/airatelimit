import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { json, urlencoded } from 'express';
import { ProxyRateLimitMiddleware } from './common/proxy-rate-limit.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // ====================================
  // SECURITY: Request body size limits
  // ====================================
  // Limit JSON body to 2MB (enough for large prompts, prevents abuse)
  app.use(json({ limit: '2mb' }));
  // Limit URL-encoded body to 1MB
  app.use(urlencoded({ extended: true, limit: '1mb' }));

  // Enable CORS for dashboard
  const corsOrigin = configService.get<string>('corsOrigin');
  app.enableCors({
    origin: corsOrigin?.includes(',')
      ? corsOrigin.split(',').map((o) => o.trim())
      : corsOrigin || true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-project-key',
      'x-identity',
      'x-tier',
      'x-session',
    ],
  });

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ====================================
  // SECURITY: Rate limiting for proxy endpoints
  // ====================================
  const rateLimitMiddleware = app.get(ProxyRateLimitMiddleware);
  // Apply rate limiting to proxy endpoints only (not dashboard APIs)
  app.use('/api/v1', rateLimitMiddleware.use.bind(rateLimitMiddleware));

  // Set global API prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`AI Rate Limit API running on http://localhost:${port}`);
  console.log(`Security: Body limit 2MB, Rate limit 120/min per IP, 600/min per project`);
}
bootstrap();
