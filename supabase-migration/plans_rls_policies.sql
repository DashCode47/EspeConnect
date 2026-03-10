-- ============================================================================
-- ROW LEVEL SECURITY (RLS) para el sistema de Planes
-- ============================================================================

-- Habilitar RLS en todas las tablas de planes
ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_chat_messages" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS para la tabla "plans"
-- ============================================================================

-- SELECT: Ver todos los planes activos o propios
CREATE POLICY "plans_select_policy"
ON "plans"
FOR SELECT
TO authenticated
USING (
  status = 'ACTIVE'
  OR creator_id = auth.uid()
);

-- INSERT: Usuarios autenticados pueden crear planes
CREATE POLICY "plans_insert_policy"
ON "plans"
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- UPDATE: Solo el creador puede actualizar su plan
CREATE POLICY "plans_update_policy"
ON "plans"
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- DELETE: Solo el creador puede eliminar su plan
CREATE POLICY "plans_delete_policy"
ON "plans"
FOR DELETE
TO authenticated
USING (creator_id = auth.uid());

-- ============================================================================
-- POLÍTICAS para la tabla "plan_participants"
-- ============================================================================

-- SELECT: Ver participantes si eres el mismo usuario, creador del plan, o si el plan está activo
CREATE POLICY "plan_participants_select_policy"
ON "plan_participants"
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
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
-- POLÍTICAS para la tabla "plan_chat_messages"
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
-- COMENTARIOS sobre las políticas
-- ============================================================================

COMMENT ON POLICY "plans_select_policy" ON "plans" IS
  'Los usuarios pueden ver planes activos o sus propios planes';

COMMENT ON POLICY "plan_participants_insert_policy" ON "plan_participants" IS
  'Los usuarios pueden unirse a planes activos';

COMMENT ON POLICY "plan_chat_messages_select_policy" ON "plan_chat_messages" IS
  'Solo los participantes activos pueden ver mensajes del chat';
