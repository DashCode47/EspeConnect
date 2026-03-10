-- ============================================================================
-- VERIFICAR Y CORREGIR PLANES
-- ============================================================================
-- Este script verifica que todos los planes tengan creadores válidos
-- y corrige los que no
-- ============================================================================

-- Paso 1: Ver todos los usuarios existentes
SELECT
  id,
  email,
  name,
  career
FROM "User"
ORDER BY "createdAt" DESC;

-- Paso 2: Ver todos los planes y sus creadores
SELECT
  p.id,
  p.title,
  p.creator_id,
  u.name as creator_name,
  u.email as creator_email,
  p.created_at
FROM plans p
LEFT JOIN "User" u ON u.id = p.creator_id
ORDER BY p.created_at DESC;

-- Paso 3: Encontrar planes con creadores inválidos (creator_id no existe en User)
SELECT
  p.id,
  p.title,
  p.creator_id,
  p.created_at
FROM plans p
WHERE NOT EXISTS (
  SELECT 1 FROM "User" u WHERE u.id = p.creator_id
);

-- Paso 4: Ver todos los participantes de planes
SELECT
  pp.id,
  pp.plan_id,
  pp.user_id,
  u.name as user_name,
  u.email as user_email,
  pp.role,
  pp.left_at
FROM plan_participants pp
LEFT JOIN "User" u ON u.id = pp.user_id
ORDER BY pp.plan_id, pp.joined_at;

-- Paso 5: Encontrar participantes con user_id inválido
SELECT
  pp.id,
  pp.plan_id,
  pp.user_id,
  pp.role
FROM plan_participants pp
WHERE NOT EXISTS (
  SELECT 1 FROM "User" u WHERE u.id = pp.user_id
);

-- ============================================================================
-- CORRECCIÓN AUTOMÁTICA
-- ============================================================================
-- Si hay planes o participantes con IDs inválidos, los actualizaremos
-- para usar el primer usuario disponible en la base de datos

DO $$
DECLARE
  first_user_id UUID;
  invalid_plans_count INT;
  invalid_participants_count INT;
BEGIN
  -- Obtener el primer usuario disponible
  SELECT id INTO first_user_id FROM "User" LIMIT 1;

  IF first_user_id IS NULL THEN
    RAISE EXCEPTION 'No hay usuarios en la tabla User. Por favor crea al menos un usuario primero.';
  END IF;

  -- Contar planes con creator_id inválido
  SELECT COUNT(*) INTO invalid_plans_count
  FROM plans p
  WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = p.creator_id);

  -- Contar participantes con user_id inválido
  SELECT COUNT(*) INTO invalid_participants_count
  FROM plan_participants pp
  WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = pp.user_id);

  -- Actualizar planes con creator_id inválido
  IF invalid_plans_count > 0 THEN
    UPDATE plans
    SET creator_id = first_user_id
    WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = plans.creator_id);

    RAISE NOTICE '✅ Actualizados % planes con creator_id inválido a usar user_id: %',
      invalid_plans_count, first_user_id;
  ELSE
    RAISE NOTICE '✅ Todos los planes tienen creator_id válidos';
  END IF;

  -- Actualizar participantes con user_id inválido
  IF invalid_participants_count > 0 THEN
    UPDATE plan_participants
    SET user_id = first_user_id
    WHERE NOT EXISTS (SELECT 1 FROM "User" u WHERE u.id = plan_participants.user_id);

    RAISE NOTICE '✅ Actualizados % participantes con user_id inválido a usar user_id: %',
      invalid_participants_count, first_user_id;
  ELSE
    RAISE NOTICE '✅ Todos los participantes tienen user_id válidos';
  END IF;

  -- Eliminar participantes duplicados (mismo plan_id + user_id activos)
  DELETE FROM plan_participants pp1
  WHERE EXISTS (
    SELECT 1 FROM plan_participants pp2
    WHERE pp2.plan_id = pp1.plan_id
    AND pp2.user_id = pp1.user_id
    AND pp2.left_at IS NULL
    AND pp1.left_at IS NULL
    AND pp2.id < pp1.id  -- Mantener el más antiguo
  );

  RAISE NOTICE '✅ Eliminados participantes duplicados';

END $$;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================

-- Ver el estado final de los planes
SELECT
  p.id,
  p.title,
  p.category,
  p.status,
  u.name as creator_name,
  u.email as creator_email,
  (SELECT COUNT(*) FROM plan_participants pp
   WHERE pp.plan_id = p.id AND pp.left_at IS NULL) as active_participants
FROM plans p
JOIN "User" u ON u.id = p.creator_id
ORDER BY p.created_at DESC;

RAISE NOTICE '============================================';
RAISE NOTICE 'Verificación completada exitosamente';
RAISE NOTICE '============================================';
