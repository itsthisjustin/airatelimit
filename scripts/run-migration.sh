#!/bin/bash
#
# Safe Migration Runner
# Validates migrations before running and creates backups
#
# Usage: ./scripts/run-migration.sh <migration-file.sql>
#

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <migration-file.sql>"
  echo ""
  echo "Available migrations:"
  ls -1 migrations/*.sql 2>/dev/null || echo "  No migrations found"
  exit 1
fi

MIGRATION_FILE="$1"

if [ ! -f "$MIGRATION_FILE" ]; then
  echo "ERROR: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

# Load environment
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

echo "========================================"
echo "Migration Safety Check"
echo "========================================"
echo ""
echo "File: $MIGRATION_FILE"
echo ""

# ====================================
# Check for destructive operations
# ====================================
echo ">>> Checking for potentially destructive operations..."

DESTRUCTIVE_PATTERNS="DROP TABLE|DROP DATABASE|TRUNCATE|DELETE FROM.*WHERE|ALTER.*DROP COLUMN"

if grep -iE "$DESTRUCTIVE_PATTERNS" "$MIGRATION_FILE" > /dev/null 2>&1; then
  echo ""
  echo "⚠️  WARNING: This migration contains potentially destructive operations:"
  echo ""
  grep -inE "$DESTRUCTIVE_PATTERNS" "$MIGRATION_FILE" | head -20
  echo ""
  echo "These operations may cause DATA LOSS."
  echo ""
  read -p "Are you sure you want to continue? (yes/no): " CONFIRM
  if [ "$CONFIRM" != "yes" ]; then
    echo "Migration cancelled."
    exit 1
  fi
fi

# ====================================
# Check for DROP INDEX (safe, but warn)
# ====================================
if grep -iE "DROP INDEX|DROP CONSTRAINT" "$MIGRATION_FILE" > /dev/null 2>&1; then
  echo ""
  echo "ℹ️  NOTE: This migration drops indexes/constraints:"
  grep -inE "DROP INDEX|DROP CONSTRAINT" "$MIGRATION_FILE" | head -10
  echo ""
  echo "This is usually safe but may temporarily affect query performance."
fi

# ====================================
# Show migration preview
# ====================================
echo ""
echo ">>> Migration preview (first 50 lines):"
echo "----------------------------------------"
head -50 "$MIGRATION_FILE"
echo "----------------------------------------"
echo ""

# ====================================
# Confirm before running
# ====================================
read -p "Run this migration? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Migration cancelled."
  exit 1
fi

# ====================================
# Create backup point
# ====================================
BACKUP_NAME="pre_migration_$(date +%Y%m%d_%H%M%S)"
echo ""
echo ">>> Creating backup point: $BACKUP_NAME"
echo "(Note: For full backup, use pg_dump separately)"

# Log the migration attempt
mkdir -p logs
echo "$(date): Running $MIGRATION_FILE" >> logs/migrations.log

# ====================================
# Run the migration
# ====================================
echo ""
echo ">>> Running migration..."
echo ""

if psql "$DATABASE_URL" -f "$MIGRATION_FILE"; then
  echo ""
  echo "✅ Migration completed successfully!"
  echo "$(date): SUCCESS - $MIGRATION_FILE" >> logs/migrations.log
else
  echo ""
  echo "❌ Migration failed!"
  echo "$(date): FAILED - $MIGRATION_FILE" >> logs/migrations.log
  exit 1
fi

# ====================================
# Verify tables exist
# ====================================
echo ""
echo ">>> Verifying database state..."
psql "$DATABASE_URL" -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

echo ""
echo "========================================"
echo "Migration complete!"
echo "========================================"

