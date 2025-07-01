#!/bin/bash

# Database maintenance script

echo "Starting database maintenance tasks..."

# Variables
DB_NAME="firmsync"
DB_USER="postgres"

# VACUUM ANALYZE
echo "Running VACUUM ANALYZE..."
psql -U $DB_USER -d $DB_NAME -c "VACUUM ANALYZE;"

# Check index usage
echo "Checking index usage..."
psql -U $DB_USER -d $DB_NAME -c "
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM 
    pg_stat_user_indexes
ORDER BY 
    idx_scan DESC
LIMIT 10;"

# Check table sizes
echo "Checking table sizes..."
psql -U $DB_USER -d $DB_NAME -c "
SELECT
    table_name,
    pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) as total_size,
    pg_size_pretty(pg_table_size(quote_ident(table_name))) as table_size,
    pg_size_pretty(pg_indexes_size(quote_ident(table_name))) as index_size
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
ORDER BY
    pg_total_relation_size(quote_ident(table_name)) DESC
LIMIT 10;"

# Check for long-running queries
echo "Checking for long-running queries..."
psql -U $DB_USER -d $DB_NAME -c "
SELECT 
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';"

# Check cache hit ratios
echo "Checking cache hit ratios..."
psql -U $DB_USER -d $DB_NAME -c "
SELECT 
    sum(heap_blks_read) as heap_read,
    sum(heap_blks_hit)  as heap_hit,
    sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio
FROM 
    pg_statio_user_tables;"

echo "Database maintenance completed!"
