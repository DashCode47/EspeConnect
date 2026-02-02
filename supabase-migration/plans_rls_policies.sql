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

-- SELECT: Ver planes públicos, de universidad, o propios
CREATE POLICY "Users can view accessible plans"
ON "plans"
FOR SELECT
TO authenticated
USING (
  visibility = 'PUBLIC'
  OR status = 'ACTIVE'
  OR creator_id = auth.uid()
);

-- INSERT: Usuarios autenticados pueden crear planes
CREATE POLICY "Users can create plans"
ON "plans"
FOR INSERT
TO authenticated
WITH CHECK (creator_id = auth.uid());

-- UPDATE: Solo el creador puede actualizar su plan
CREATE POLICY "Creators can update their plans"
ON "plans"
FOR UPDATE
TO authenticated
USING (creator_id = auth.uid())
WITH CHECK (creator_id = auth.uid());

-- DELETE: Solo el creador puede eliminar su plan
CREATE POLICY "Creators can delete their plans"
ON "plans"
FOR DELETE
TO authenticated
USING (creator_id = auth.uid());

-- ============================================================================
-- POLÍTICAS para la tabla "plan_participants"
-- ============================================================================

-- SELECT: Ver participantes de planes accesibles
CREATE POLICY "Users can view participants of accessible plans"
ON "plan_participants"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "plans"
    WHERE "plans"."id" = "plan_participants"."plan_id"
    AND (
      "plans"."visibility" = 'PUBLIC'
      OR "plans"."status" = 'ACTIVE'
      OR "plans"."creator_id" = auth.uid()
      OR EXISTS (
        SELECT 1 FROM "plan_participants" pp
        WHERE pp."plan_id" = "plans"."id"
        AND pp."user_id" = auth.uid()
        AND pp."left_at" IS NULL
      )
    )
  )
);

-- INSERT: Usuarios pueden unirse a planes
CREATE POLICY "Users can join plans"
ON "plan_participants"
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM "plans"
    WHERE "plans"."id" = "plan_participants"."plan_id"
    AND "plans"."status" = 'ACTIVE'
    AND (
      "plans"."max_participants" IS NULL
      OR (
        SELECT COUNT(*)
        FROM "plan_participants" pp
        WHERE pp."plan_id" = "plans"."id"
        AND pp."left_at" IS NULL
      ) < "plans"."max_participants"
    )
  )
);

-- UPDATE: Usuarios pueden actualizar su propia participación (para salir)
CREATE POLICY "Users can update their participation"
ON "plan_participants"
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE: Usuarios pueden eliminar su participación, o el creador puede eliminar participantes
CREATE POLICY "Users can leave plans or creators can remove participants"
ON "plan_participants"
FOR DELETE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "plans"
    WHERE "plans"."id" = "plan_participants"."plan_id"
    AND "plans"."creator_id" = auth.uid()
  )
);

-- ============================================================================
-- POLÍTICAS para la tabla "plan_chat_messages"
-- ============================================================================

-- SELECT: Solo participantes activos pueden ver mensajes
CREATE POLICY "Plan participants can view messages"
ON "plan_chat_messages"
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM "plan_participants"
    WHERE "plan_participants"."plan_id" = "plan_chat_messages"."plan_id"
    AND "plan_participants"."user_id" = auth.uid()
    AND "plan_participants"."left_at" IS NULL
  )
);

-- INSERT: Solo participantes activos pueden enviar mensajes
CREATE POLICY "Plan participants can send messages"
ON "plan_chat_messages"
FOR INSERT
TO authenticated
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM "plan_participants"
    WHERE "plan_participants"."plan_id" = "plan_chat_messages"."plan_id"
    AND "plan_participants"."user_id" = auth.uid()
    AND "plan_participants"."left_at" IS NULL
  )
);

-- DELETE: El autor del mensaje o el creador del plan pueden eliminar mensajes
CREATE POLICY "Message author or plan creator can delete messages"
ON "plan_chat_messages"
FOR DELETE
TO authenticated
USING (
  sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "plans"
    WHERE "plans"."id" = "plan_chat_messages"."plan_id"
    AND "plans"."creator_id" = auth.uid()
  )
);

-- ============================================================================
-- COMENTARIOS sobre las políticas
-- ============================================================================

COMMENT ON POLICY "Users can view accessible plans" ON "plans" IS
  'Los usuarios pueden ver planes públicos, activos, o sus propios planes';

COMMENT ON POLICY "Users can join plans" ON "plan_participants" IS
  'Los usuarios solo pueden unirse a planes activos que no hayan alcanzado el límite de participantes';

COMMENT ON POLICY "Plan participants can view messages" ON "plan_chat_messages" IS
  'Solo los participantes activos (left_at IS NULL) pueden ver mensajes del chat';
