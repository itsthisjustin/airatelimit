-- Migration: Add identity_limits table for per-identity limit overrides
-- Run this after 001-initial-schema.sql

CREATE TABLE IF NOT EXISTS identity_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "projectId" UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    identity VARCHAR(255) NOT NULL,
    "requestLimit" INTEGER,
    "tokenLimit" INTEGER,
    "customResponse" JSONB,
    metadata JSONB,
    enabled BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("projectId", identity)
);

-- Index for fast lookups by project
CREATE INDEX IF NOT EXISTS idx_identity_limits_project ON identity_limits("projectId");

-- Index for finding all limits for a project + identity
CREATE INDEX IF NOT EXISTS idx_identity_limits_project_identity ON identity_limits("projectId", identity);

