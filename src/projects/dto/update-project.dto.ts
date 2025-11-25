import { IsString, IsOptional, IsInt, IsObject, IsIn, IsArray, IsBoolean } from 'class-validator';

export class UpdateProjectDto {
  @IsOptional()
  @IsString()
  name?: string;

  // Provider can be set during initial configuration (before project key is generated)
  // Legacy single-provider configuration
  @IsOptional()
  @IsIn(['openai', 'anthropic', 'google', 'xai', 'other'])
  provider?: 'openai' | 'anthropic' | 'google' | 'xai' | 'other';

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  openaiApiKey?: string;

  // Multi-provider configuration
  // Example: { "openai": { "apiKey": "sk-...", "baseUrl": "..." }, "anthropic": { "apiKey": "sk-ant-..." } }
  @IsOptional()
  @IsObject()
  providerKeys?: Record<string, { apiKey: string; baseUrl?: string }>;

  @IsOptional()
  @IsInt()
  dailyRequestLimit?: number;

  @IsOptional()
  @IsInt()
  dailyTokenLimit?: number;

  // Limit period
  @IsOptional()
  @IsIn(['daily', 'weekly', 'monthly'])
  limitPeriod?: 'daily' | 'weekly' | 'monthly';

  // Limit type
  @IsOptional()
  @IsIn(['requests', 'tokens', 'both'])
  limitType?: 'requests' | 'tokens' | 'both';

  @IsOptional()
  @IsObject()
  limitExceededResponse?: any;

  // Model-specific limits
  @IsOptional()
  @IsObject()
  modelLimits?: Record<string, { requestLimit?: number; tokenLimit?: number }>;

  // Tier configuration
  @IsOptional()
  @IsObject()
  tiers?: Record<string, { 
    requestLimit?: number; 
    tokenLimit?: number; 
    customResponse?: any;
    modelLimits?: Record<string, { requestLimit?: number; tokenLimit?: number }>;
  }>;

  // Rules configuration
  @IsOptional()
  @IsArray()
  rules?: Array<{
    id: string;
    name: string;
    enabled: boolean;
    condition: any;
    action: any;
  }>;

  // Security configuration
  @IsOptional()
  @IsBoolean()
  securityEnabled?: boolean;

  @IsOptional()
  @IsIn(['block', 'log'])
  securityMode?: 'block' | 'log';

  @IsOptional()
  @IsArray()
  securityCategories?: string[];

  @IsOptional()
  @IsBoolean()
  securityHeuristicsEnabled?: boolean;
}

