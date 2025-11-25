-- Migration: Add multi-provider support
-- Description: Adds providerKeys JSONB column for storing multiple provider configurations per project

-- Add providerKeys column for multi-provider configuration
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS "providerKeys" JSONB DEFAULT NULL;

-- Add index for faster lookups on providerKeys
CREATE INDEX IF NOT EXISTS idx_projects_provider_keys 
ON projects USING gin ("providerKeys") 
WHERE "providerKeys" IS NOT NULL;

-- Comment explaining the structure
COMMENT ON COLUMN projects."providerKeys" IS 'Multi-provider configuration. Structure: { "openai": { "apiKey": "sk-...", "baseUrl": "..." }, "anthropic": { "apiKey": "sk-ant-..." } }';

