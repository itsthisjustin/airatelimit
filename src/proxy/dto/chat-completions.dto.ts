import {
  IsArray,
  IsString,
  MaxLength,
  ArrayMaxSize,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsNumber,
  Max,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Individual message in chat completions request
 */
class MessageDto {
  @IsString()
  @MaxLength(50)
  role: string;

  @IsString()
  @MaxLength(500000) // 500k chars max per message (~125k tokens)
  content: string;
}

/**
 * Validated request body for chat completions
 * Prevents oversized payloads and malformed requests
 */
export class ChatCompletionsDto {
  @IsString()
  @MaxLength(128)
  model: string;

  @IsArray()
  @ArrayMaxSize(200) // Max 200 messages per request
  @ValidateNested({ each: true })
  @Type(() => MessageDto)
  messages: MessageDto[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(128000) // Max tokens for largest models
  max_tokens?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  top_p?: number;

  @IsOptional()
  @IsBoolean()
  stream?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  n?: number;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  stop?: string[];

  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  presence_penalty?: number;

  @IsOptional()
  @IsNumber()
  @Min(-2)
  @Max(2)
  frequency_penalty?: number;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  user?: string;
}

/**
 * Image generation request body
 */
export class ImageGenerationDto {
  @IsString()
  @MaxLength(4000) // DALL-E max prompt length
  prompt: string;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  model?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  n?: number;

  @IsOptional()
  @IsIn(['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'])
  size?: string;

  @IsOptional()
  @IsIn(['standard', 'hd'])
  quality?: string;

  @IsOptional()
  @IsIn(['vivid', 'natural'])
  style?: string;

  @IsOptional()
  @IsIn(['url', 'b64_json'])
  response_format?: string;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  user?: string;
}

/**
 * Embeddings request body
 */
export class EmbeddingsDto {
  @IsString()
  @MaxLength(64)
  model: string;

  // Can be string or array of strings
  input: string | string[];

  @IsOptional()
  @IsString()
  @MaxLength(64)
  encoding_format?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3072)
  dimensions?: number;

  @IsOptional()
  @IsString()
  @MaxLength(256)
  user?: string;
}

/**
 * Audio transcription request body
 */
export class AudioTranscriptionDto {
  @IsOptional()
  @IsString()
  @MaxLength(64)
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  prompt?: string;

  @IsOptional()
  @IsIn(['json', 'text', 'srt', 'verbose_json', 'vtt'])
  response_format?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  temperature?: number;
}

