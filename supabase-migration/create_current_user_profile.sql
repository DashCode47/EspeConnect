-- ============================================================================
-- CREAR PERFIL PARA EL USUARIO ACTUAL
-- ============================================================================
-- Este script ayuda a crear un perfil en la tabla User para el usuario
-- actualmente autenticado
-- ============================================================================

-- Paso 1: Ver el usuario autenticado actual y su información de auth
SELECT
  auth.uid() as auth_user_id,
  auth.email() as auth_email;

-- Paso 2: Verificar si el usuario autenticado tiene un perfil en User
SELECT
  u.id,
  u.email,
  u.name,
  u.career,
  u."createdAt"
FROM "User" u
WHERE u.id = auth.uid();

-- Paso 3: Ver todos los usuarios en la tabla User (para referencia)
SELECT
  id,
  email,
  name,
  career,
  role
FROM "User"
ORDER BY "createdAt" DESC
LIMIT 10;

-- ============================================================================
-- CREAR PERFIL AUTOMÁTICAMENTE
-- ============================================================================
-- Este bloque creará un perfil para el usuario autenticado si no existe

DO $$
DECLARE
  current_auth_id UUID;
  current_auth_email TEXT;
  user_exists BOOLEAN;
BEGIN
  -- Obtener el ID y email del usuario autenticado
  current_auth_id := auth.uid();
  current_auth_email := auth.email();

  IF current_auth_id IS NULL THEN
    RAISE EXCEPTION 'No hay un usuario autenticado. Por favor inicia sesión primero.';
  END IF;

  -- Verificar si ya existe un perfil
  SELECT EXISTS(SELECT 1 FROM "User" WHERE id = current_auth_id) INTO user_exists;

  IF user_exists THEN
    RAISE NOTICE '✅ El usuario autenticado ya tiene un perfil en la tabla User';
    RAISE NOTICE '   User ID: %', current_auth_id;
    RAISE NOTICE '   Email: %', current_auth_email;
  ELSE
    -- Crear el perfil automáticamente
    INSERT INTO "User" (
      id,
      email,
      password,
      name,
      career,
      gender,
      bio,
      role
    ) VALUES (
      current_auth_id,
      current_auth_email,
      'auth_managed', -- Password es manejado por Supabase Auth
      COALESCE(current_auth_email::text, 'Usuario'),
      'Sin especificar',
      'Otro',
      'Usuario creado automáticamente',
      'STUDENT'
    );

    RAISE NOTICE '✅ Perfil creado exitosamente para el usuario autenticado';
    RAISE NOTICE '   User ID: %', current_auth_id;
    RAISE NOTICE '   Email: %', current_auth_email;
    RAISE NOTICE '   ⚠️  IMPORTANTE: Actualiza tu perfil desde la app para completar tu información';
  END IF;

END $$;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Ver el perfil del usuario actual
SELECT
  u.id,
  u.email,
  u.name,
  u.career,
  u.gender,
  u.bio,
  u.role,
  u."createdAt"
FROM "User" u
WHERE u.id = auth.uid();

-- Ver planes donde este usuario es participante
SELECT
  p.id,
  p.title,
  p.category,
  pp.role as my_role,
  pp.joined_at
FROM plan_participants pp
JOIN plans p ON p.id = pp.plan_id
WHERE pp.user_id = auth.uid()
  AND pp.left_at IS NULL
ORDER BY pp.joined_at DESC;

RAISE NOTICE '============================================';
RAISE NOTICE 'Verificación completada';
RAISE NOTICE 'Si el perfil fue creado, ahora deberías poder unirte a planes';
RAISE NOTICE '============================================';
