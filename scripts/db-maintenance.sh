#!/bin/bash
#
# Database Maintenance Script
# Runs cleanup and optimization tasks
#
# Usage: ./scripts/db-maintenance.sh [full|quick|cleanup|vacuum|stats]
#
# Commands:
#   full    - Run complete maintenance (cleanup + vacuum + analyze)
#   quick   - Run analyze only (fast, updates statistics)
#   cleanup - Run data retention cleanup only
#   vacuum  - Run vacuum analyze on high-write tables
#   stats   - Show table and index statistics
#

set -e

# Load environment
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

MODE="${1:-quick}"

echo "==================================="
echo "Database Maintenance - Mode: $MODE"
echo "==================================="
echo ""

case $MODE in
  full)
    echo ">>> Running full maintenance..."
    echo ""
    
    echo "Step 1: Data cleanup"
    psql "$DATABASE_URL" -c "SELECT * FROM run_all_cleanups(90, 30, 7);"
    
    echo ""
    echo "Step 2: Vacuum analyze (this may take a while)"
    psql "$DATABASE_URL" -c "VACUUM ANALYZE usage_counters;"
    psql "$DATABASE_URL" -c "VACUUM ANALYZE security_events;"
    psql "$DATABASE_URL" -c "VACUUM ANALYZE anonymization_logs;"
    psql "$DATABASE_URL" -c "VACUUM ANALYZE projects;"
    
    echo ""
    echo "Step 3: Table statistics"
    psql "$DATABASE_URL" -c "SELECT * FROM table_statistics;"
    ;;
    
  quick)
    echo ">>> Running quick maintenance (analyze only)..."
    psql "$DATABASE_URL" -c "SELECT vacuum_high_write_tables();"
    echo ""
    echo "Table statistics:"
    psql "$DATABASE_URL" -c "SELECT * FROM table_statistics;"
    ;;
    
  cleanup)
    echo ">>> Running data cleanup..."
    echo ""
    echo "Retention settings:"
    echo "  - Usage counters: 90 days"
    echo "  - Security events: 30 days"
    echo "  - Anonymization logs: 7 days"
    echo ""
    psql "$DATABASE_URL" -c "SELECT * FROM run_all_cleanups(90, 30, 7);"
    ;;
    
  vacuum)
    echo ">>> Running vacuum analyze on high-write tables..."
    echo "(This may take a while for large tables)"
    echo ""
    psql "$DATABASE_URL" -c "VACUUM (VERBOSE, ANALYZE) usage_counters;"
    psql "$DATABASE_URL" -c "VACUUM (VERBOSE, ANALYZE) security_events;"
    psql "$DATABASE_URL" -c "VACUUM (VERBOSE, ANALYZE) anonymization_logs;"
    ;;
    
  stats)
    echo ">>> Table Statistics"
    psql "$DATABASE_URL" -c "SELECT * FROM table_statistics;"
    echo ""
    echo ">>> Index Usage (top 20)"
    psql "$DATABASE_URL" -c "SELECT * FROM index_usage LIMIT 20;"
    echo ""
    echo ">>> Usage Counters by Period"
    psql "$DATABASE_URL" -c "
      SELECT 
        \"periodStart\"::date as date,
        COUNT(*) as rows,
        COUNT(DISTINCT \"projectId\") as projects,
        COUNT(DISTINCT identity) as identities
      FROM usage_counters
      GROUP BY \"periodStart\"::date
      ORDER BY \"periodStart\"::date DESC
      LIMIT 10;
    "
    ;;
    
  *)
    echo "Unknown mode: $MODE"
    echo ""
    echo "Usage: $0 [full|quick|cleanup|vacuum|stats]"
    exit 1
    ;;
esac

echo ""
echo "==================================="
echo "Maintenance complete!"
echo "==================================="

