# database-explorer.ps1 - Interactive Database Explorer
# Run this script to navigate your fut_jaguar database

function Show-DatabaseMenu {
    Clear-Host
    Write-Host "🐘 FUT JAGUAR DATABASE EXPLORER" -ForegroundColor Cyan
    Write-Host "=================================" -ForegroundColor Cyan
    Write-Host "Container: futnext-database" -ForegroundColor Yellow
    Write-Host "Schema: fut_jaguar" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1.  📋 Show all tables" -ForegroundColor White
    Write-Host "2.  🔢 Show table record counts" -ForegroundColor White
    Write-Host "3.  ⚙️  Show all functions" -ForegroundColor Green
    Write-Host "4.  🔧 Show all procedures" -ForegroundColor Green
    Write-Host "5.  🔗 Show table relationships" -ForegroundColor Blue
    Write-Host "6.  🔑 Show primary keys" -ForegroundColor Blue
    Write-Host "7.  📊 Show indexes" -ForegroundColor Blue
    Write-Host "8.  📈 Show database size info" -ForegroundColor Magenta
    Write-Host "9.  🔍 Run complete inspection" -ForegroundColor Yellow
    Write-Host "10. 🖥️  Connect to database shell" -ForegroundColor Red
    Write-Host "11. 📝 Show specific table structure" -ForegroundColor White
    Write-Host "12. 🔍 Show specific function/procedure" -ForegroundColor Green
    Write-Host "0.  ❌ Exit" -ForegroundColor Red
    Write-Host ""
}

function Show-AllTables {
    Write-Host "📋 ALL TABLES IN fut_jaguar SCHEMA" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    
    $query = @"
SET search_path TO fut_jaguar;
SELECT 
    tablename as table_name,
    hasindexes as has_indexes,
    hastriggers as has_triggers
FROM pg_tables 
WHERE schemaname = 'fut_jaguar'
ORDER BY tablename;
"@
    
    docker exec -i futnext-database psql -U admin -d futnext_db -c $query
}

function Show-TableCounts {
    Write-Host "🔢 TABLE RECORD COUNTS" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    
    $query = @"
SET search_path TO fut_jaguar;
SELECT 'categories' as table_name, count(*) as records from categories
UNION ALL SELECT 'credentials', count(*) from credentials
UNION ALL SELECT 'inscription', count(*) from inscription  
UNION ALL SELECT 'users', count(*) from users
UNION ALL SELECT 'tournaments', count(*) from tournaments
UNION ALL SELECT 'divisions', count(*) from divisions
UNION ALL SELECT 'teams', count(*) from teams
UNION ALL SELECT 'team_stats', count(*) from team_stats
UNION ALL SELECT 'players', count(*) from players
UNION ALL SELECT 'matches', count(*) from matches
UNION ALL SELECT 'player_debts', count(*) from player_debts
UNION ALL SELECT 'team_debts', count(*) from team_debts
ORDER BY table_name;
"@
    
    docker exec -i futnext-database psql -U admin -d futnext_db -c $query
}

function Show-AllFunctions {
    Write-Host "⚙️  ALL FUNCTIONS AND PROCEDURES" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    
    $query = @"
SELECT 
    CASE WHEN prokind = 'f' THEN '📋 FUNCTION' ELSE '🔧 PROCEDURE' END as type,
    proname as name,
    pg_get_function_arguments(p.oid) as parameters
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'fut_jaguar' AND prokind IN ('f', 'p')
ORDER BY prokind DESC, proname;
"@
    
    docker exec -i futnext-database psql -U admin -d futnext_db -c $query
}

function Show-TableRelationships {
    Write-Host "🔗 TABLE RELATIONSHIPS (FOREIGN KEYS)" -ForegroundColor Blue
    Write-Host "=====================================" -ForegroundColor Blue
    
    $query = @"
SELECT
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'fut_jaguar'
ORDER BY tc.table_name;
"@
    
    docker exec -i futnext-database psql -U admin -d futnext_db -c $query
}

function Show-PrimaryKeys {
    Write-Host "🔑 PRIMARY KEYS" -ForegroundColor Blue
    Write-Host "===============" -ForegroundColor Blue
    
    $query = @"
SELECT 
    tc.table_name,
    string_agg(kcu.column_name, ', ') as primary_key_columns
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'fut_jaguar'
    AND tc.constraint_type = 'PRIMARY KEY'
GROUP BY tc.table_name
ORDER BY tc.table_name;
"@
    
    docker exec -i futnext-database psql -U admin -d futnext_db -c $query
}

function Show-Indexes {
    Write-Host "📊 INDEXES" -ForegroundColor Blue
    Write-Host "==========" -ForegroundColor Blue
    
    $query = @"
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'fut_jaguar'
ORDER BY tablename, indexname;
"@
    
    docker exec -i futnext-database psql -U admin -d futnext_db -c $query
}

function Show-DatabaseSize {
    Write-Host "📈 DATABASE SIZE INFORMATION" -ForegroundColor Magenta
    Write-Host "============================" -ForegroundColor Magenta
    
    $query = @"
SELECT 
    pg_size_pretty(pg_database_size(current_database())) as database_size,
    pg_size_pretty(pg_total_relation_size('fut_jaguar.teams')) as teams_table_size,
    pg_size_pretty(pg_total_relation_size('fut_jaguar.players')) as players_table_size,
    pg_size_pretty(pg_total_relation_size('fut_jaguar.matches')) as matches_table_size;
"@
    
    docker exec -i futnext-database psql -U admin -d futnext_db -c $query
}

function Run-CompleteInspection {
    Write-Host "🔍 RUNNING COMPLETE DATABASE INSPECTION..." -ForegroundColor Yellow
    
    # Check if inspection script exists
    if (!(Test-Path "database-inspector.sql")) {
        Write-Host "❌ database-inspector.sql not found!" -ForegroundColor Red
        Write-Host "💡 Please create the SQL script first" -ForegroundColor Yellow
        return
    }
    
    docker exec -i futnext-database psql -U admin -d futnext_db < database-inspector.sql
}

function Connect-ToDatabase {
    Write-Host "🖥️  CONNECTING TO DATABASE SHELL..." -ForegroundColor Red
    Write-Host "💡 Use \q to exit the database shell" -ForegroundColor Yellow
    Write-Host "💡 Schema is already set to fut_jaguar" -ForegroundColor Yellow
    docker exec -it futnext-database psql -U admin -d futnext_db -c "SET search_path TO fut_jaguar;"
}

function Show-SpecificTable {
    Write-Host "📝 TABLE STRUCTURE" -ForegroundColor White
    Write-Host "==================" -ForegroundColor White
    $tableName = Read-Host "Enter table name (e.g., teams, players, matches)"
    
    if ($tableName) {
        docker exec -i futnext-database psql -U admin -d futnext_db -c "\d fut_jaguar.$tableName"
    }
}

function Show-SpecificFunction {
    Write-Host "🔍 FUNCTION/PROCEDURE DEFINITION" -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    $functionName = Read-Host "Enter function/procedure name (e.g., check_tournament_stage)"
    
    if ($functionName) {
        docker exec -i futnext-database psql -U admin -d futnext_db -c "\sf fut_jaguar.$functionName"
    }
}

# Main menu loop
do {
    Show-DatabaseMenu
    $choice = Read-Host "Select option"
    
    switch ($choice) {
        1 { Show-AllTables; Pause }
        2 { Show-TableCounts; Pause }
        3 { Show-AllFunctions; Pause }
        4 { Show-AllFunctions; Pause }  # Same as 3 since it shows both
        5 { Show-TableRelationships; Pause }
        6 { Show-PrimaryKeys; Pause }
        7 { Show-Indexes; Pause }
        8 { Show-DatabaseSize; Pause }
        9 { Run-CompleteInspection; Pause }
        10 { Connect-ToDatabase }
        11 { Show-SpecificTable; Pause }
        12 { Show-SpecificFunction; Pause }
        0 { Write-Host "👋 Goodbye!" -ForegroundColor Green; exit }
        default { Write-Host "❌ Invalid option" -ForegroundColor Red; Pause }
    }
} while ($true)