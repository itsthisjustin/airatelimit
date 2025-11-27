-- Migration: Add anonymization and session-based limits
-- Version: 006

-- Add anonymization configuration to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "anonymizationEnabled" BOOLEAN DEFAULT false;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "anonymizationConfig" JSONB DEFAULT '{"detectEmail": true, "detectPhone": true, "detectSSN": true, "detectCreditCard": true, "detectIpAddress": true, "maskingStyle": "placeholder"}';

-- Add session-based limits configuration to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "sessionLimitsEnabled" BOOLEAN DEFAULT false;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "sessionRequestLimit" INTEGER;

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "sessionTokenLimit" INTEGER;

-- Add session tracking to usage_counters
ALTER TABLE usage_counters 
ADD COLUMN IF NOT EXISTS "session" VARCHAR(255) DEFAULT '';

-- Update unique constraint to include session
-- First drop the old constraint
ALTER TABLE usage_counters 
DROP CONSTRAINT IF EXISTS "IDX_usage_counters_projectId_identity_periodStart_model";

-- Create new unique index including session
CREATE UNIQUE INDEX IF NOT EXISTS "IDX_usage_counters_project_identity_period_model_session" 
ON usage_counters ("projectId", identity, "periodStart", model, "session");

-- Add index for session-based queries
CREATE INDEX IF NOT EXISTS "IDX_usage_counters_session" 
ON usage_counters ("projectId", "session") 
WHERE "session" != '';

-- Create anonymization_logs table to track PII detections (optional, for audit)
CREATE TABLE IF NOT EXISTS anonymization_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "projectId" UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  identity VARCHAR(255) NOT NULL,
  session VARCHAR(255) DEFAULT '',
  "piiTypesDetected" TEXT[] NOT NULL,
  "replacementCount" INTEGER NOT NULL DEFAULT 0,
  endpoint VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "IDX_anonymization_logs_project" 
ON anonymization_logs ("projectId", "createdAt" DESC);

-- Add comment for documentation
COMMENT ON COLUMN projects."anonymizationEnabled" IS 'Enable PII detection and masking before forwarding to AI providers';
COMMENT ON COLUMN projects."anonymizationConfig" IS 'Configuration for which PII types to detect and how to mask them';
COMMENT ON COLUMN projects."sessionLimitsEnabled" IS 'Enable per-session rate limits in addition to identity limits';
COMMENT ON COLUMN projects."sessionRequestLimit" IS 'Maximum requests per session (null = unlimited)';
COMMENT ON COLUMN projects."sessionTokenLimit" IS 'Maximum tokens per session (null = unlimited)';
COMMENT ON COLUMN usage_counters."session" IS 'Session identifier for session-based rate limiting';

