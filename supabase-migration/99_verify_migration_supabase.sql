-- =====================================================
-- CamPlus - Supabase Migration
-- VERIFICATION SCRIPT (Para SQL Editor de Supabase)
-- =====================================================
-- Este script verifica que todos los pasos de migración se completaron exitosamente
-- Ejecuta este script DESPUÉS de ejecutar todos los scripts de migración
-- =====================================================

-- =====================================================
-- RESUMEN EJECUTIVO - Ejecuta esto primero
-- =====================================================

SELECT
  '=== VERIFICACIÓN DE MIGRACIÓN CAMPLUS ===' as title;

WITH verification_summary AS (
  SELECT
    'ENUMs' as component,
    COUNT(*) as actual,
    6 as expected,
    CASE WHEN COUNT(*) = 6 THEN '✓ OK' ELSE '✗ ERROR' END as status
  FROM pg_type
  WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')

  UNION ALL

  SELECT
    'Tables' as component,
    COUNT(*) as actual,
    18 as expected,
    CASE WHEN COUNT(*) = 18 THEN '✓ OK' ELSE '✗ ERROR' END as status
  FROM pg_tables
  WHERE schemaname = 'public'

  UNION ALL

  SELECT
    'Tables owned by postgres' as component,
    COUNT(*) as actual,
    18 as expected,
    CASE WHEN COUNT(*) = 18 THEN '✓ OK' ELSE '✗ ERROR' END as status
  FROM pg_tables
  WHERE schemaname = 'public' AND tableowner = 'postgres'

  UNION ALL

  SELECT
    'Triggers' as component,
    COUNT(*) as actual,
    8 as expected,
    CASE WHEN COUNT(*) = 8 THEN '✓ OK' ELSE '✗ ERROR' END as status
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'

  UNION ALL

  SELECT
    'Tables with RLS enabled' as component,
    COUNT(*) as actual,
    18 as expected,
    CASE WHEN COUNT(*) = 18 THEN '✓ OK' ELSE '✗ ERROR' END as status
  FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = true

  UNION ALL

  SELECT
    'RLS Policies' as component,
    COUNT(*) as actual,
    50 as expected,
    CASE WHEN COUNT(*) >= 50 THEN '✓ OK' ELSE '?' END as status
  FROM pg_policies
  WHERE schemaname = 'public'

  UNION ALL

  SELECT
    'Storage Buckets' as component,
    COUNT(*) as actual,
    6 as expected,
    CASE WHEN COUNT(*) = 6 THEN '✓ OK' ELSE '✗ ERROR' END as status
  FROM storage.buckets
  WHERE id IN ('avatars', 'posts', 'events', 'banners', 'establishments', 'careers')

  UNION ALL

  SELECT
    'Storage RLS Policies' as component,
    COUNT(*) as actual,
    20 as expected,
    CASE WHEN COUNT(*) >= 20 THEN '✓ OK' ELSE '?' END as status
  FROM pg_policies
  WHERE schemaname = 'storage' AND tablename = 'objects'
)
SELECT
  component as "Componente",
  expected as "Esperado",
  actual as "Real",
  status as "Estado"
FROM verification_summary;

-- =====================================================
-- VERIFICACIONES DETALLADAS
-- =====================================================
-- Descomenta las secciones que quieras revisar en detalle
-- =====================================================

-- =====================================================
-- 1. Verificar ENUMs
-- =====================================================
/*
SELECT '=== 1. TIPOS ENUM ===' as section;

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
*/

-- =====================================================
-- 2. Verificar Tablas y Ownership
-- =====================================================
/*
SELECT '=== 2. TABLAS Y OWNERSHIP ===' as section;

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

SELECT COUNT(*) as total_tables FROM pg_tables WHERE schemaname = 'public';
*/

-- =====================================================
-- 3. Verificar Índices
-- =====================================================
/*
SELECT '=== 3. ÍNDICES ===' as section;

SELECT
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public' AND indexname NOT LIKE '%_pkey'
ORDER BY tablename, indexname;
*/

-- =====================================================
-- 4. Verificar Triggers
-- =====================================================
/*
SELECT '=== 4. TRIGGERS ===' as section;

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
*/

-- =====================================================
-- 5. Verificar RLS Habilitado
-- =====================================================
/*
SELECT '=== 5. ROW LEVEL SECURITY (RLS) ===' as section;

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
*/

-- =====================================================
-- 6. Verificar Políticas RLS
-- =====================================================
/*
SELECT '=== 6. POLÍTICAS RLS ===' as section;

SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

SELECT COUNT(*) as total_policies FROM pg_policies WHERE schemaname = 'public';
*/

-- =====================================================
-- 7. Verificar Storage Buckets
-- =====================================================
/*
SELECT '=== 7. STORAGE BUCKETS ===' as section;

SELECT
  id,
  name,
  public,
  file_size_limit / 1048576 as max_size_mb,
  CASE
    WHEN id IN ('avatars', 'posts', 'events', 'banners', 'establishments', 'careers') THEN '✓'
    ELSE '?'
  END as expected_bucket
FROM storage.buckets
ORDER BY name;

SELECT COUNT(*) as total_buckets
FROM storage.buckets
WHERE id IN ('avatars', 'posts', 'events', 'banners', 'establishments', 'careers');
*/

-- =====================================================
-- 8. Verificar Storage Policies (RLS en storage.objects)
-- =====================================================
/*
SELECT '=== 8. STORAGE POLICIES ===' as section;

SELECT
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

SELECT COUNT(*) as total_storage_policies
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
*/

-- =====================================================
-- 9. Verificar Foreign Keys
-- =====================================================
/*
SELECT '=== 9. FOREIGN KEYS ===' as section;

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

SELECT COUNT(*) as total_foreign_keys
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public';
*/

-- =====================================================
-- INTERPRETACIÓN DE RESULTADOS
-- =====================================================
-- Si todos los componentes muestran ✓ OK, la migración fue exitosa.
-- Si alguno muestra ✗ ERROR, revisa las secciones detalladas descomentando el código correspondiente.
--
-- Para ver detalles de un componente específico:
-- 1. Descomenta la sección que quieres revisar (elimina /* y */)
-- 2. Ejecuta el script nuevamente
--
-- =====================================================
