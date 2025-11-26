-- Migration: Add secretKey column to projects table
-- This key is used for programmatic API access (server-side only)

ALTER TABLE projects ADD COLUMN IF NOT EXISTS "secretKey" VARCHAR(255) UNIQUE;

-- Generate secret keys for existing projects that don't have one
UPDATE projects 
SET "secretKey" = 'sk_' || encode(gen_random_bytes(24), 'hex')
WHERE "secretKey" IS NULL;

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_projects_secret_key ON projects("secretKey");

