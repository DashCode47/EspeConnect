-- ============================================================================
-- FIX: Políticas RLS para evitar recursión infinita
-- ============================================================================
-- Este script reemplaza las políticas problemáticas con versiones simplificadas
-- ============================================================================

-- Primero, eliminar las políticas existentes
DROP POLICY IF EXISTS "Users can view participants of accessible plans" ON "plan_participants";
DROP POLICY IF EXISTS "Users can join plans" ON "plan_participants";
DROP POLICY IF EXISTS "Users can update their participation" ON "plan_participants";
DROP POLICY IF EXISTS "Users can leave plans or creators can remove participants" ON "plan_participants";

DROP POLICY IF EXISTS "Users can view accessible plans" ON "plans";
DROP POLICY IF EXISTS "Users can create plans" ON "plans";
DROP POLICY IF EXISTS "Creators can update their plans" ON "plans";
DROP POLICY IF EXISTS "Creators can delete their plans" ON "plans";

DROP POLICY IF EXISTS "Plan participants can view messages" ON "plan_chat_messages";
DROP POLICY IF EXISTS "Plan participants can send messages" ON "plan_chat_messages";
DROP POLICY IF EXISTS "Message author or plan creator can delete messages" ON "plan_chat_messages";

-- ============================================================================
-- NUEVAS POLÍTICAS SIMPLIFICADAS PARA "plans"
-- ============================================================================

-- SELECT: Ver todos los planes activos
CREATE POLICY "plans_select_policy"
ON "plans"
FOR SELECT
TO authenticated
USING (
  status = 'ACTIVE'
  OR creator_id = auth.uid()
);

-- INSERT: Crear planes
CREATE POLICY "plans_insert_policy"
ON "plans"
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- UPDATE: Solo el creador puede actualizar
CREATE POLICY "plans_update_policy"
ON "plans"
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- DELETE: Solo el creador puede eliminar
CREATE POLICY "plans_delete_policy"
ON "plans"
FOR DELETE
TO authenticated
USING (creator_id = auth.uid());

-- ============================================================================
-- NUEVAS POLÍTICAS SIMPLIFICADAS PARA "plan_participants"
-- ============================================================================

-- SELECT: Ver participantes de cualquier plan activo o del que eres creador
CREATE POLICY "plan_participants_select_policy"
ON "plan_participants"
FOR SELECT
TO authenticated
USING (
  -- El usuario puede ver participantes si:
  user_id = auth.uid()  -- Es él mismo
  OR EXISTS (
    -- O si el plan es del usuario o está activo
    SELECT 1 FROM "plans" p
    WHERE p.id = plan_id
    AND (p.creator_id = auth.uid() OR p.status = 'ACTIVE')
  )
);

-- INSERT: Cualquiera puede unirse a un plan activo
CREATE POLICY "plan_participants_insert_policy"
ON "plan_participants"
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM "plans" p
    WHERE p.id = plan_id
    AND p.status = 'ACTIVE'
  )
);

-- UPDATE: Solo puede actualizar su propia participación
CREATE POLICY "plan_participants_update_policy"
ON "plan_participants"
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Puede eliminar su propia participación o si es el creador del plan
CREATE POLICY "plan_participants_delete_policy"
ON "plan_participants"
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "plans" p
    WHERE p.id = plan_id
    AND p.creator_id = auth.uid()
  )
);

-- ============================================================================
-- NUEVAS POLÍTICAS SIMPLIFICADAS PARA "plan_chat_messages"
-- ============================================================================

-- SELECT: Ver mensajes de planes donde eres participante activo
CREATE POLICY "plan_chat_messages_select_policy"
ON "plan_chat_messages"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "plan_participants" pp
    WHERE pp.plan_id = plan_chat_messages.plan_id
    AND pp.user_id = auth.uid()
    AND pp.left_at IS NULL
  )
);

-- INSERT: Enviar mensajes solo si eres participante activo
CREATE POLICY "plan_chat_messages_insert_policy"
ON "plan_chat_messages"
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM "plan_participants" pp
    WHERE pp.plan_id = plan_chat_messages.plan_id
    AND pp.user_id = auth.uid()
    AND pp.left_at IS NULL
  )
);

-- DELETE: Eliminar tus propios mensajes o si eres el creador del plan
CREATE POLICY "plan_chat_messages_delete_policy"
ON "plan_chat_messages"
FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "plans" p
    WHERE p.id = plan_chat_messages.plan_id
    AND p.creator_id = auth.uid()
  )
);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Ver las políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  cmd
FROM pg_policies
WHERE tablename IN ('plans', 'plan_participants', 'plan_chat_messages')
ORDER BY tablename, cmd, policyname;

-- Test rápido (esto debería funcionar sin recursión infinita)
-- Descomentar las siguientes líneas para probar:
-- SELECT * FROM plans LIMIT 5;
-- SELECT * FROM plan_participants LIMIT 10;
-- SELECT * FROM plan_chat_messages LIMIT 10;
