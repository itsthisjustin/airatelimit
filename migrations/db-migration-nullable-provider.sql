-- Migration: Make provider and baseUrl nullable (remove defaults)
-- Date: 2025-11-23
-- Description: Allow projects to be created without provider configuration.
--              Provider and baseUrl will be set during initial setup.

-- Remove default from provider column and make it nullable
ALTER TABLE projects 
  ALTER COLUMN provider DROP DEFAULT,
  ALTER COLUMN provider DROP NOT NULL;

-- Remove default from baseUrl column (already nullable in code)
ALTER TABLE projects 
  ALTER COLUMN "baseUrl" DROP DEFAULT;

-- Note: Existing projects will keep their current provider values
-- New projects will have NULL provider until configured

