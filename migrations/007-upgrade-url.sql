-- Migration: Add upgrade URL for deep link responses
-- Version: 007

-- Add upgradeUrl column to projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "upgradeUrl" TEXT;

-- Add comment for documentation
COMMENT ON COLUMN projects."upgradeUrl" IS 'URL auto-injected into rate limit responses. Supports template vars: {{tier}}, {{identity}}, {{usage}}, {{limit}}';

