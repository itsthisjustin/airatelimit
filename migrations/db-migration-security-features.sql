-- Add security configuration columns to projects table
-- Use DO block to handle columns that may already exist
DO $$
BEGIN
    -- Add securityEnabled column (TypeORM camelCase format)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='projects' AND column_name='securityEnabled') THEN
        ALTER TABLE projects ADD COLUMN "securityEnabled" BOOLEAN DEFAULT false;
    END IF;

    -- Add securityMode column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='projects' AND column_name='securityMode') THEN
        ALTER TABLE projects ADD COLUMN "securityMode" VARCHAR(20) DEFAULT 'block';
    END IF;

    -- Add securityCategories column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='projects' AND column_name='securityCategories') THEN
        ALTER TABLE projects ADD COLUMN "securityCategories" JSONB DEFAULT '["systemPromptExtraction", "roleManipulation", "instructionOverride", "boundaryBreaking", "obfuscation", "directLeakage"]'::jsonb;
    END IF;

    -- Add securityHeuristicsEnabled column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='projects' AND column_name='securityHeuristicsEnabled') THEN
        ALTER TABLE projects ADD COLUMN "securityHeuristicsEnabled" BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Note: The security_events table and its indexes will be auto-created by TypeORM
-- because synchronize: true is enabled in development

