#!/bin/bash

# Script to test database query performance

echo "Starting database query performance tests..."

# Variables
DB_NAME="firmsync"
DB_USER="postgres"
TEST_QUERIES=(
    "SELECT * FROM firm_users WHERE firm_id = 1 ORDER BY created_at DESC LIMIT 10"
    "SELECT * FROM audit_logs WHERE firm_id = 1 AND timestamp > NOW() - INTERVAL '24 hours'"
    "SELECT * FROM ai_triage_results WHERE firm_id = 1 AND created_at > NOW() - INTERVAL '7 days'"
)

# Function to test query execution time
test_query() {
    local query="$1"
    echo "Testing query: $query"
    echo "Execution plan:"
    psql -U $DB_USER -d $DB_NAME -c "EXPLAIN ANALYZE $query"
    echo "----------------------------------------"
}

# Test each query
for query in "${TEST_QUERIES[@]}"; do
    test_query "$query"
done

# Check index usage
echo "Checking index usage stats..."
psql -U $DB_USER -d $DB_NAME -c "
SELECT 
    relname as table_name,
    indexrelname as index_name,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM 
    pg_stat_user_indexes
JOIN 
    pg_stat_user_tables 
    ON pg_stat_user_indexes.relid = pg_stat_user_tables.relid
WHERE 
    idx_scan > 0 
ORDER BY 
    idx_scan DESC;
