-- ============================================================================
-- MIGRACIÓN COMPLETA DEL SISTEMA DE PLANES
-- ============================================================================
-- Este script ejecuta todas las migraciones necesarias para el sistema de planes
-- en el orden correcto.
--
-- INSTRUCCIONES:
-- 1. Ejecuta este script en el SQL Editor de Supabase
-- 2. O ejecuta cada archivo individualmente en este orden
-- ============================================================================

\echo '=========================================='
\echo 'Iniciando migración del sistema de Planes'
\echo '=========================================='

-- PASO 1: Crear ENUMs
\echo 'PASO 1: Creando ENUMs...'
\i plans_enums.sql

-- PASO 2: Crear Tablas
\echo 'PASO 2: Creando tablas...'
\i plans_tables.sql

-- PASO 3: Crear Triggers
\echo 'PASO 3: Creando triggers...'
\i plans_triggers.sql

-- PASO 4: Habilitar RLS y crear políticas
\echo 'PASO 4: Configurando Row Level Security...'
\i plans_rls_policies.sql

\echo '=========================================='
\echo 'Migración completada exitosamente!'
\echo '=========================================='

-- Verificación final
\echo 'Verificando tablas creadas...'
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('plans', 'plan_participants', 'plan_chat_messages')
ORDER BY table_name;

\echo 'Verificando ENUMs creados...'
SELECT
  typname as enum_name,
  (SELECT COUNT(*) FROM pg_enum WHERE enumtypid = t.oid) as value_count
FROM pg_type t
WHERE typtype = 'e'
  AND typname LIKE 'Plan%'
ORDER BY typname;

\echo 'Verificando políticas RLS...'
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('plans', 'plan_participants', 'plan_chat_messages')
ORDER BY tablename, cmd, policyname;
