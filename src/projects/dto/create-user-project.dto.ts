import {
  IsString,
  IsOptional,
  IsInt,
  IsObject,
  IsIn,
  IsArray,
  ValidateIf,
} from 'class-validator';

export class CreateUserProjectDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsIn(['openai', 'anthropic', 'google', 'xai', 'other'])
  provider?: 'openai' | 'anthropic' | 'google' | 'xai' | 'other';

  @IsOptional()
  @IsString()
  baseUrl?: string;

  @IsOptional()
  @IsString()
  openaiApiKey?: string;

  @IsOptional()
  @ValidateIf((o) => o.dailyRequestLimit !== null && o.dailyRequestLimit !== '')
  @IsInt()
  dailyRequestLimit?: number | null;

  @IsOptional()
  @ValidateIf((o) => o.dailyTokenLimit !== null && o.dailyTokenLimit !== '')
  @IsInt()
  dailyTokenLimit?: number | null;

  // Limit period
  @IsOptional()
  @IsIn(['hourly', 'daily', 'weekly', 'monthly'])
  limitPeriod?: 'hourly' | 'daily' | 'weekly' | 'monthly';

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
  tiers?: Record<
    string,
    {
      requestLimit?: number;
      tokenLimit?: number;
      customResponse?: any;
      modelLimits?: Record<
        string,
        { requestLimit?: number; tokenLimit?: number }
      >;
    }
  >;

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
}
