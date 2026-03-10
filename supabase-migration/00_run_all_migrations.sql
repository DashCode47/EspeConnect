-- =====================================================
-- ESPEConnect - Supabase Migration
-- MASTER MIGRATION SCRIPT
-- =====================================================
-- This script runs all migration steps in the correct order
-- Execute this in the Supabase SQL Editor or via psql
-- =====================================================
--
-- IMPORTANT: This script is designed to be run in Supabase SQL Editor
-- which automatically commits after each statement.
--
-- If you're running via psql, wrap in a transaction:
-- BEGIN;
-- \i 00_run_all_migrations.sql
-- COMMIT;
-- =====================================================

\echo '======================================================='
\echo 'ESPEConnect Supabase Migration - Phase 1'
\echo 'Starting database migration...'
\echo '======================================================='

-- =====================================================
-- Step 1: Create ENUMs
-- =====================================================
\echo ''
\echo 'Step 1/6: Creating ENUM types...'
\i 01_create_enums.sql
\echo 'Step 1/6: ✓ ENUMs created successfully'

-- =====================================================
-- Step 2: Create Tables
-- =====================================================
\echo ''
\echo 'Step 2/6: Creating tables...'
\i 02_create_tables.sql
\echo 'Step 2/6: ✓ Tables created successfully'

-- =====================================================
-- Step 3: Create Triggers
-- =====================================================
\echo ''
\echo 'Step 3/6: Creating triggers for updatedAt columns...'
\i 03_create_triggers.sql
\echo 'Step 3/6: ✓ Triggers created successfully'

-- =====================================================
-- Step 4: Enable RLS
-- =====================================================
\echo ''
\echo 'Step 4/6: Enabling Row Level Security...'
\i 04_enable_rls.sql
\echo 'Step 4/6: ✓ RLS enabled successfully'

-- =====================================================
-- Step 5: Create RLS Policies
-- =====================================================
\echo ''
\echo 'Step 5/6: Creating RLS policies...'
\i 05_create_rls_policies.sql
\echo 'Step 5/6: ✓ RLS policies created successfully'

-- =====================================================
-- Step 6: Create Storage Buckets
-- =====================================================
\echo ''
\echo 'Step 6/6: Creating storage buckets and policies...'
\i 06_create_storage_buckets.sql
\echo 'Step 6/6: ✓ Storage configured successfully'

-- =====================================================
-- Migration Complete
-- =====================================================
\echo ''
\echo '======================================================='
\echo 'ESPEConnect Migration Complete!'
\echo '======================================================='
\echo ''
\echo 'Next steps:'
\echo '1. Run verification script: \i 99_verify_migration.sql'
\echo '2. Create test data (optional)'
\echo '3. Generate TypeScript types for frontend'
\echo '4. Update frontend to use Supabase client'
\echo ''
\echo 'For verification, run: \i 99_verify_migration.sql'
\echo '======================================================='
