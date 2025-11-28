import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Rate limit entry for tracking requests
 */
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

/**
 * In-memory rate limiting middleware for proxy endpoints
 * 
 * Provides two levels of protection:
 * 1. Global IP-based rate limiting (prevent anonymous abuse)
 * 2. Project-based rate limiting (prevent abuse per project key)
 * 
 * For horizontal scaling, replace with Redis-backed implementation
 */
@Injectable()
export class ProxyRateLimitMiddleware implements NestMiddleware {
  // Rate limit: 120 requests per minute per IP
  private readonly IP_LIMIT = 120;
  private readonly IP_WINDOW_MS = 60 * 1000;

  // Rate limit: 600 requests per minute per project key
  private readonly PROJECT_LIMIT = 600;
  private readonly PROJECT_WINDOW_MS = 60 * 1000;

  // In-memory stores
  private readonly ipLimits = new Map<string, RateLimitEntry>();
  private readonly projectLimits = new Map<string, RateLimitEntry>();

  // Cleanup interval
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  use(req: Request, res: Response, next: NextFunction) {
    const now = Date.now();

    // Get client IP (handle proxies)
    const clientIp = this.getClientIp(req);
    const projectKey = req.headers['x-project-key'] as string;

    // Check IP rate limit
    const ipCheck = this.checkLimit(
      this.ipLimits,
      clientIp,
      this.IP_LIMIT,
      this.IP_WINDOW_MS,
      now,
    );

    if (!ipCheck.allowed) {
      res.setHeader('X-RateLimit-Limit', this.IP_LIMIT.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', ipCheck.resetAt.toString());
      res.setHeader('Retry-After', Math.ceil((ipCheck.resetAt - now) / 1000).toString());

      return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
        error: {
          message: 'Too many requests. Please slow down.',
          type: 'rate_limit_exceeded',
          code: 'ip_rate_limit',
          retryAfter: Math.ceil((ipCheck.resetAt - now) / 1000),
        },
      });
    }

    // Check project rate limit (if project key provided)
    if (projectKey) {
      const projectCheck = this.checkLimit(
        this.projectLimits,
        projectKey,
        this.PROJECT_LIMIT,
        this.PROJECT_WINDOW_MS,
        now,
      );

      if (!projectCheck.allowed) {
        res.setHeader('X-RateLimit-Limit', this.PROJECT_LIMIT.toString());
        res.setHeader('X-RateLimit-Remaining', '0');
        res.setHeader('X-RateLimit-Reset', projectCheck.resetAt.toString());
        res.setHeader('Retry-After', Math.ceil((projectCheck.resetAt - now) / 1000).toString());

        return res.status(HttpStatus.TOO_MANY_REQUESTS).json({
          error: {
            message: 'Too many requests for this project. Please slow down.',
            type: 'rate_limit_exceeded',
            code: 'project_rate_limit',
            retryAfter: Math.ceil((projectCheck.resetAt - now) / 1000),
          },
        });
      }

      // Set rate limit headers for project
      res.setHeader('X-RateLimit-Limit', this.PROJECT_LIMIT.toString());
      res.setHeader('X-RateLimit-Remaining', projectCheck.remaining.toString());
      res.setHeader('X-RateLimit-Reset', projectCheck.resetAt.toString());
    }

    next();
  }

  /**
   * Check rate limit and increment counter
   */
  private checkLimit(
    store: Map<string, RateLimitEntry>,
    key: string,
    limit: number,
    windowMs: number,
    now: number,
  ): { allowed: boolean; remaining: number; resetAt: number } {
    const entry = store.get(key);

    // No entry or window expired - start fresh
    if (!entry || now >= entry.windowStart + windowMs) {
      store.set(key, { count: 1, windowStart: now });
      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: now + windowMs,
      };
    }

    // Within window - check limit
    if (entry.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.windowStart + windowMs,
      };
    }

    // Increment and allow
    entry.count++;
    return {
      allowed: true,
      remaining: limit - entry.count,
      resetAt: entry.windowStart + windowMs,
    };
  }

  /**
   * Get client IP, handling reverse proxies
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      // x-forwarded-for can be a comma-separated list; take the first (original client)
      return (typeof forwarded === 'string' ? forwarded : forwarded[0])
        .split(',')[0]
        .trim();
    }
    return req.socket.remoteAddress || 'unknown';
  }

  /**
   * Cleanup expired entries to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now();

    for (const [key, entry] of this.ipLimits.entries()) {
      if (now >= entry.windowStart + this.IP_WINDOW_MS) {
        this.ipLimits.delete(key);
      }
    }

    for (const [key, entry] of this.projectLimits.entries()) {
      if (now >= entry.windowStart + this.PROJECT_WINDOW_MS) {
        this.projectLimits.delete(key);
      }
    }
  }

  /**
   * Cleanup on module destroy
   */
  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

