-- ============================================================================
-- MIGRAR SISTEMA DE PLANES DE "User" A "profiles"
-- ============================================================================
-- Este script migra todas las referencias de la tabla User a profiles
-- para mantener consistencia con el sistema de eventos
-- ============================================================================

-- Paso 1: Verificar que existan ambas tablas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'La tabla profiles no existe. Créala primero.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'plans') THEN
    RAISE EXCEPTION 'La tabla plans no existe. Ejecuta el script de creación de planes primero.';
  END IF;

  RAISE NOTICE '✅ Tablas verificadas: profiles y plans existen';
END $$;

-- ============================================================================
-- PASO 2: Eliminar restricciones FK existentes con User
-- ============================================================================

-- Drop FK de plans.creator_id -> User.id
ALTER TABLE plans
DROP CONSTRAINT IF EXISTS plans_creator_id_fkey;

-- Drop FK de plan_participants.user_id -> User.id
ALTER TABLE plan_participants
DROP CONSTRAINT IF EXISTS plan_participants_user_id_fkey;

-- Drop FK de plan_chat_messages.sender_id -> User.id
ALTER TABLE plan_chat_messages
DROP CONSTRAINT IF EXISTS plan_chat_messages_sender_id_fkey;

DO $$ BEGIN
  RAISE NOTICE '✅ Eliminadas restricciones FK con tabla User';
END $$;

-- ============================================================================
-- PASO 3: Crear perfiles faltantes desde auth.users
-- ============================================================================
-- Asegurar que todos los usuarios autenticados tengan un perfil

INSERT INTO profiles (id, full_name, email, updated_at)
SELECT
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.email,
    'Usuario'
  ) AS full_name,
  au.email,
  NOW() AS updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  RAISE NOTICE '✅ Perfiles creados para usuarios sin perfil';
END $$;

-- ============================================================================
-- PASO 4: Limpiar datos inválidos
-- ============================================================================

-- Eliminar planes con creator_id que no existe en profiles
DELETE FROM plans
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = plans.creator_id);

-- Eliminar participantes con user_id que no existe en profiles
DELETE FROM plan_participants
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = plan_participants.user_id);

-- Eliminar mensajes con sender_id que no existe en profiles
DELETE FROM plan_chat_messages
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = plan_chat_messages.sender_id);

DO $$ BEGIN
  RAISE NOTICE '✅ Datos inválidos eliminados';
END $$;

-- ============================================================================
-- PASO 5: Crear nuevas restricciones FK con profiles
-- ============================================================================

-- Add FK de plans.creator_id -> profiles.id
ALTER TABLE plans
ADD CONSTRAINT plans_creator_id_profiles_fkey
FOREIGN KEY (creator_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add FK de plan_participants.user_id -> profiles.id
ALTER TABLE plan_participants
ADD CONSTRAINT plan_participants_user_id_profiles_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add FK de plan_chat_messages.sender_id -> profiles.id
ALTER TABLE plan_chat_messages
ADD CONSTRAINT plan_chat_messages_sender_id_profiles_fkey
FOREIGN KEY (sender_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

DO $$ BEGIN
  RAISE NOTICE '✅ Nuevas restricciones FK con profiles creadas';
END $$;

-- ============================================================================
-- PASO 6: Verificar las relaciones
-- ============================================================================

-- Ver planes y sus creadores desde profiles
SELECT
  p.id,
  p.title,
  p.category,
  p.status,
  prof.full_name as creator_name,
  prof.email as creator_email,
  (SELECT COUNT(*) FROM plan_participants pp
   WHERE pp.plan_id = p.id AND pp.left_at IS NULL) as active_participants
FROM plans p
JOIN profiles prof ON prof.id = p.creator_id
ORDER BY p.created_at DESC;

-- Ver todas las FKs de las tablas de planes
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('plans', 'plan_participants', 'plan_chat_messages')
ORDER BY tc.table_name, tc.constraint_name;

-- ============================================================================
-- RESULTADO
-- ============================================================================

DO $$
DECLARE
  plans_count INT;
  participants_count INT;
  messages_count INT;
BEGIN
  SELECT COUNT(*) INTO plans_count FROM plans;
  SELECT COUNT(*) INTO participants_count FROM plan_participants;
  SELECT COUNT(*) INTO messages_count FROM plan_chat_messages;

  RAISE NOTICE '============================================';
  RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total de planes: %', plans_count;
  RAISE NOTICE 'Total de participantes: %', participants_count;
  RAISE NOTICE 'Total de mensajes: %', messages_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Ahora todas las tablas de planes usan profiles';
  RAISE NOTICE 'Actualiza el código de tu app para usar profiles';
  RAISE NOTICE '============================================';
END $$;
