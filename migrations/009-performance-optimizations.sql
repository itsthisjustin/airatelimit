-- Migration: Database Performance Optimizations
-- Version: 009
-- 
-- This migration adds indexes and configuration for improved performance
-- on high-traffic rate limiting operations.

-- =====================================================
-- USAGE_COUNTERS INDEXES (Hot path - every API request)
-- =====================================================

-- Primary lookup index: covers the atomic UPDATE WHERE clause
-- This is the most critical index as it's used on every proxy request
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_usage_counters_lookup"
ON usage_counters ("projectId", identity, model, "session", "periodStart");

-- Index for identity cardinality checks (security feature)
-- Used to count unique identities per project per period
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_usage_counters_identity_cardinality"
ON usage_counters ("projectId", "periodStart", identity);

-- Index for session cardinality checks (security feature)
-- Used to count unique sessions per identity per period
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_usage_counters_session_cardinality"
ON usage_counters ("projectId", identity, "periodStart", "session");

-- Index for dashboard aggregation queries (by model)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_usage_counters_model_stats"
ON usage_counters ("projectId", "periodStart", model)
INCLUDE ("requestsUsed", "tokensUsed", "costUsd");

-- Partial index for non-empty sessions (common query pattern)
DROP INDEX IF EXISTS "IDX_usage_counters_session";
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_usage_counters_active_sessions"
ON usage_counters ("projectId", "session", "periodStart")
WHERE "session" != '';

-- =====================================================
-- PROJECTS TABLE INDEXES
-- =====================================================

-- Index for projectKey lookups (used on every proxy request)
-- This should be highly selective - covers findByProjectKey()
DROP INDEX IF EXISTS "IDX_projects_projectKey";
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS "IDX_projects_projectKey"
ON projects ("projectKey") 
WHERE "projectKey" IS NOT NULL;

-- =====================================================
-- SECURITY_EVENTS TABLE INDEXES
-- =====================================================

-- Composite index for dashboard security event queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_security_events_project_created"
ON security_events ("projectId", "createdAt" DESC);

-- Partial index for blocked events only (common filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_security_events_blocked"
ON security_events ("projectId", "createdAt" DESC)
WHERE blocked = true;

-- =====================================================
-- ANONYMIZATION_LOGS TABLE INDEXES
-- =====================================================

-- Index for dashboard anonymization log queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_anonymization_logs_project_created"
ON anonymization_logs ("projectId", "createdAt" DESC);

-- =====================================================
-- IDENTITY_LIMITS TABLE INDEXES
-- =====================================================

-- Index for enabled identity lookups (common filter)
CREATE INDEX CONCURRENTLY IF NOT EXISTS "IDX_identity_limits_enabled"
ON identity_limits ("projectId", identity)
WHERE enabled = true;

-- =====================================================
-- TABLE STORAGE PARAMETERS (for high-write tables)
-- =====================================================

-- usage_counters: Optimize for high-write workload
-- - Lower fillfactor leaves room for HOT updates
-- - autovacuum runs more frequently on this table
ALTER TABLE usage_counters SET (
  fillfactor = 80,
  autovacuum_vacuum_scale_factor = 0.05,
  autovacuum_analyze_scale_factor = 0.02,
  autovacuum_vacuum_cost_delay = 10
);

-- security_events: Mostly inserts, rarely updated
ALTER TABLE security_events SET (
  fillfactor = 90,
  autovacuum_vacuum_scale_factor = 0.1,
  autovacuum_analyze_scale_factor = 0.05
);

-- anonymization_logs: Insert-only, never updated
ALTER TABLE anonymization_logs SET (
  fillfactor = 100,
  autovacuum_vacuum_scale_factor = 0.2,
  autovacuum_analyze_scale_factor = 0.1
);

-- =====================================================
-- STATISTICS TARGETS (improve query planning)
-- =====================================================

-- Increase statistics for frequently filtered columns
ALTER TABLE usage_counters ALTER COLUMN "projectId" SET STATISTICS 500;
ALTER TABLE usage_counters ALTER COLUMN identity SET STATISTICS 500;
ALTER TABLE usage_counters ALTER COLUMN "periodStart" SET STATISTICS 200;
ALTER TABLE usage_counters ALTER COLUMN model SET STATISTICS 200;

ALTER TABLE projects ALTER COLUMN "projectKey" SET STATISTICS 500;

-- =====================================================
-- ANALYZE TABLES (update statistics immediately)
-- =====================================================

ANALYZE usage_counters;
ANALYZE projects;
ANALYZE security_events;
ANALYZE anonymization_logs;
ANALYZE identity_limits;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON INDEX "IDX_usage_counters_lookup" IS 'Primary lookup for atomic usage updates - hot path';
COMMENT ON INDEX "IDX_usage_counters_identity_cardinality" IS 'Cardinality check for DDoS protection';
COMMENT ON INDEX "IDX_usage_counters_session_cardinality" IS 'Session cardinality check for DDoS protection';

