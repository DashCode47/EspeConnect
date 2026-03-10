-- =====================================================
-- ESPEConnect - Supabase Migration
-- VERIFICATION SCRIPT
-- =====================================================
-- This script verifies that all migration steps completed successfully
-- Run this after executing the migration scripts
-- =====================================================

\echo '======================================================='
\echo 'ESPEConnect Migration Verification'
\echo '======================================================='

-- =====================================================
-- Verify ENUMs
-- =====================================================
\echo ''
\echo '1. Checking ENUM types...'
SELECT
  typname as enum_name,
  CASE
    WHEN typname IN ('UserRole', 'PostType', 'PromotionCategory', 'TripStatus', 'TripRequestStatus', 'EventCategory')
    THEN '✓'
    ELSE '✗'
  END as status
FROM pg_type
WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
ORDER BY typname;

\echo ''
\echo 'Expected: 6 ENUMs (UserRole, PostType, PromotionCategory, TripStatus, TripRequestStatus, EventCategory)'

-- =====================================================
-- Verify Tables
-- =====================================================
\echo ''
\echo '2. Checking tables and ownership...'
SELECT
  tablename,
  tableowner,
  CASE
    WHEN tableowner = 'postgres' THEN '✓'
    ELSE '✗ WRONG OWNER'
  END as owner_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo 'Expected: 18 tables, all owned by postgres'
SELECT COUNT(*) as total_tables FROM pg_tables WHERE schemaname = 'public';

-- =====================================================
-- Verify Indexes
-- =====================================================
\echo ''
\echo '3. Checking indexes...'
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;

-- =====================================================
-- Verify Triggers
-- =====================================================
\echo ''
\echo '4. Checking triggers...'
SELECT
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation,
  CASE
    WHEN action_statement LIKE '%update_updated_at_column%' THEN '✓'
    ELSE '?'
  END as correct_function
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo ''
\echo 'Expected: 8 triggers (User, Banner, Establishment, Promotion, Career, Trip, Event, Comment)'

-- =====================================================
-- Verify RLS is Enabled
-- =====================================================
\echo ''
\echo '5. Checking Row Level Security (RLS)...'
SELECT
  tablename,
  rowsecurity,
  CASE
    WHEN rowsecurity THEN '✓ RLS Enabled'
    ELSE '✗ RLS NOT ENABLED'
  END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

\echo ''
\echo 'Expected: RLS enabled (rowsecurity = t) on all 18 tables'

-- =====================================================
-- Verify RLS Policies
-- =====================================================
\echo ''
\echo '6. Checking RLS Policies...'
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

\echo ''
\echo 'Total RLS policies:'
SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';

\echo ''
\echo 'Policy details (showing policy names by table):'
SELECT
  tablename,
  policyname,
  cmd as operation,
  CASE
    WHEN roles = '{public}' THEN 'Public'
    WHEN roles = '{authenticated}' THEN 'Authenticated'
    ELSE array_to_string(roles, ', ')
  END as applies_to
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =====================================================
-- Verify Storage Buckets
-- =====================================================
\echo ''
\echo '7. Checking Storage Buckets...'
SELECT
  id,
  name,
  public,
  file_size_limit / 1048576 as max_size_mb,
  allowed_mime_types,
  CASE
    WHEN id IN ('avatars', 'posts', 'events', 'banners', 'establishments', 'careers') THEN '✓'
    ELSE '?'
  END as expected_bucket
FROM storage.buckets
ORDER BY name;

\echo ''
\echo 'Expected: 6 buckets (avatars, posts, events, banners, establishments, careers)'
SELECT COUNT(*) as total_buckets FROM storage.buckets;

-- =====================================================
-- Verify Storage Policies
-- =====================================================
\echo ''
\echo '8. Checking Storage Policies...'
SELECT
  bucket_id,
  COUNT(*) as policy_count
FROM storage.policies
GROUP BY bucket_id
ORDER BY bucket_id;

\echo ''
\echo 'Total storage policies:'
SELECT COUNT(*) as total_storage_policies FROM storage.policies;

-- =====================================================
-- Check Foreign Key Relationships
-- =====================================================
\echo ''
\echo '9. Checking Foreign Key Constraints...'
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

\echo ''
\echo 'Foreign keys count:'
SELECT COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';

-- =====================================================
-- Summary Report
-- =====================================================
\echo ''
\echo '======================================================='
\echo 'VERIFICATION SUMMARY'
\echo '======================================================='

WITH verification_summary AS (
  SELECT
    'ENUMs' as component,
    COUNT(*) as actual,
    6 as expected,
    CASE WHEN COUNT(*) = 6 THEN '✓' ELSE '✗' END as status
  FROM pg_type
  WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')

  UNION ALL

  SELECT
    'Tables' as component,
    COUNT(*) as actual,
    18 as expected,
    CASE WHEN COUNT(*) = 18 THEN '✓' ELSE '✗' END as status
  FROM pg_tables
  WHERE schemaname = 'public'

  UNION ALL

  SELECT
    'Tables with postgres ownership' as component,
    COUNT(*) as actual,
    18 as expected,
    CASE WHEN COUNT(*) = 18 THEN '✓' ELSE '✗' END as status
  FROM pg_tables
  WHERE schemaname = 'public' AND tableowner = 'postgres'

  UNION ALL

  SELECT
    'Triggers' as component,
    COUNT(*) as actual,
    8 as expected,
    CASE WHEN COUNT(*) = 8 THEN '✓' ELSE '✗' END as status
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'

  UNION ALL

  SELECT
    'Tables with RLS enabled' as component,
    COUNT(*) as actual,
    18 as expected,
    CASE WHEN COUNT(*) = 18 THEN '✓' ELSE '✗' END as status
  FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = true

  UNION ALL

  SELECT
    'RLS Policies' as component,
    COUNT(*) as actual,
    50 as expected,
    CASE WHEN COUNT(*) >= 50 THEN '✓' ELSE '?' END as status
  FROM pg_policies
  WHERE schemaname = 'public'

  UNION ALL

  SELECT
    'Storage Buckets' as component,
    COUNT(*) as actual,
    6 as expected,
    CASE WHEN COUNT(*) = 6 THEN '✓' ELSE '✗' END as status
  FROM storage.buckets

  UNION ALL

  SELECT
    'Storage Policies' as component,
    COUNT(*) as actual,
    24 as expected,
    CASE WHEN COUNT(*) >= 20 THEN '✓' ELSE '?' END as status
  FROM storage.policies
)
SELECT
  component as "Component",
  expected as "Expected",
  actual as "Actual",
  status as "Status"
FROM verification_summary;

\echo ''
\echo '======================================================='
\echo 'Verification Complete!'
\echo ''
\echo 'If all checks show ✓, the migration was successful.'
\echo 'If any checks show ✗, review the detailed output above.'
\echo '======================================================='
