import { IsString, MaxLength, IsOptional, Matches, MinLength } from 'class-validator';

/**
 * Validated proxy request headers
 * Prevents oversized or malformed header values
 */
export class ProxyHeadersDto {
  @IsString()
  @MinLength(35) // pk_ + 32 hex chars
  @MaxLength(64)
  @Matches(/^pk_[a-f0-9]{32}$/, {
    message: 'Invalid project key format',
  })
  projectKey: string;

  @IsString()
  @MinLength(1)
  @MaxLength(512) // Reasonable identity length (email, user ID, etc.)
  identity: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  tier?: string;

  @IsOptional()
  @IsString()
  @MaxLength(128) // Session IDs should be reasonable
  session?: string;
}

/**
 * Validate and sanitize proxy headers from request
 */
export function validateProxyHeaders(headers: {
  projectKey?: string;
  identity?: string;
  tier?: string;
  session?: string;
}): { valid: boolean; error?: string } {
  // Project key validation
  if (!headers.projectKey) {
    return { valid: false, error: 'Missing x-project-key header' };
  }
  if (headers.projectKey.length > 64) {
    return { valid: false, error: 'x-project-key header too long' };
  }
  if (!/^pk_[a-f0-9]{32}$/.test(headers.projectKey)) {
    return { valid: false, error: 'Invalid x-project-key format' };
  }

  // Identity validation
  if (!headers.identity) {
    return { valid: false, error: 'Missing x-identity header' };
  }
  if (headers.identity.length > 512) {
    return { valid: false, error: 'x-identity header too long (max 512 chars)' };
  }
  if (headers.identity.length < 1) {
    return { valid: false, error: 'x-identity header cannot be empty' };
  }

  // Tier validation (optional)
  if (headers.tier && headers.tier.length > 64) {
    return { valid: false, error: 'x-tier header too long (max 64 chars)' };
  }

  // Session validation (optional)
  if (headers.session && headers.session.length > 128) {
    return { valid: false, error: 'x-session header too long (max 128 chars)' };
  }

  return { valid: true };
}

