-- ===================================================
-- DATABASE INSPECTOR SCRIPT FOR fut_jaguar SCHEMA
-- ===================================================
-- Save this as: database-inspector.sql
-- Run with: docker exec -i futnext-database psql -U admin -d futnext_db < database-inspector.sql

\echo '🔍 DATABASE INSPECTION REPORT'
\echo '================================='

-- Set search path to your schema
SET search_path TO fut_jaguar, public;

\echo ''
\echo '📊 SCHEMA INFORMATION'
\echo '===================='
SELECT 'fut_jaguar' as schema_name, 
       current_database() as database_name,
       current_user as connected_user,
       version() as postgres_version;

\echo ''
\echo '📋 ALL TABLES IN fut_jaguar SCHEMA'
\echo '==================================='
SELECT 
    schemaname as schema,
    tablename as table_name,
    tableowner as owner,
    hasindexes as has_indexes,
    hasrules as has_rules,
    hastriggers as has_triggers
FROM pg_tables 
WHERE schemaname = 'fut_jaguar'
ORDER BY tablename;

\echo ''
\echo '🔢 TABLE RECORD COUNTS'
\echo '======================'
DO $$
DECLARE
    table_record RECORD;
    query_text TEXT;
    record_count INTEGER;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'fut_jaguar'
        ORDER BY tablename
    LOOP
        query_text := 'SELECT COUNT(*) FROM fut_jaguar.' || table_record.tablename;
        EXECUTE query_text INTO record_count;
        RAISE NOTICE '%-25s: % records', table_record.tablename, record_count;
    END LOOP;
END $$;

\echo ''
\echo '⚙️  ALL FUNCTIONS IN fut_jaguar SCHEMA'
\echo '======================================'
SELECT 
    proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    prokind as function_type,
    proisstrict as is_strict,
    provolatile as volatility
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'fut_jaguar'
  AND prokind IN ('f', 'p')  -- f = function, p = procedure
ORDER BY prokind, proname;

\echo ''
\echo '🔧 DETAILED FUNCTION/PROCEDURE LIST'
\echo '==================================='
SELECT 
    CASE 
        WHEN prokind = 'f' THEN '📋 FUNCTION'
        WHEN prokind = 'p' THEN '⚙️  PROCEDURE'
        ELSE '❓ OTHER'
    END as type,
    proname as name,
    pg_get_function_arguments(p.oid) as parameters,
    CASE 
        WHEN prokind = 'f' THEN pg_get_function_result(p.oid)
        ELSE 'VOID'
    END as returns
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'fut_jaguar'
  AND prokind IN ('f', 'p')
ORDER BY prokind DESC, proname;

\echo ''
\echo '🔗 TABLE RELATIONSHIPS (FOREIGN KEYS)'
\echo '====================================='
SELECT
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column,
    tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'fut_jaguar'
ORDER BY tc.table_name, kcu.column_name;

\echo ''
\echo '📇 TABLE COLUMN DETAILS'
\echo '======================'
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'fut_jaguar'
ORDER BY table_name, ordinal_position;

\echo ''
\echo '🔑 PRIMARY KEYS AND UNIQUE CONSTRAINTS'
\echo '======================================'
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'fut_jaguar'
    AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_name, tc.constraint_type;

\echo ''
\echo '📊 INDEXES'
\echo '=========='
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'fut_jaguar'
ORDER BY tablename, indexname;

\echo ''
\echo '🎯 TRIGGERS'
\echo '==========='
SELECT 
    trigger_name,
    event_object_table as table_name,
    action_timing,
    event_manipulation as trigger_event,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'fut_jaguar'
ORDER BY event_object_table, trigger_name;

\echo ''
\echo '📈 DATABASE SIZE INFORMATION'
\echo '============================'
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    pg_size_pretty(pg_total_relation_size('fut_jaguar.teams')) as teams_table_size,
    pg_size_pretty(pg_total_relation_size('fut_jaguar.players')) as players_table_size,
    pg_size_pretty(pg_total_relation_size('fut_jaguar.matches')) as matches_table_size;

\echo ''
\echo '✅ INSPECTION COMPLETE!'
\echo '======================='