-- ============================================================================
-- MIGRACIÓN COMPLETA DEL SISTEMA DE PLANES - TODO EN UNO
-- ============================================================================
-- Ejecuta este script directamente en el SQL Editor de Supabase
-- ============================================================================

-- ============================================================================
-- PASO 1: CREAR ENUMS
-- ============================================================================

-- Categoría de planes
CREATE TYPE "PlanCategory" AS ENUM (
  'CAFE',
  'FIESTA',
  'ESTUDIO',
  'DEPORTE',
  'CINE',
  'MUSICA',
  'VIAJE',
  'COMIDA',
  'OTRO'
);

-- Visibilidad del plan
CREATE TYPE "PlanVisibility" AS ENUM (
  'PUBLIC',
  'UNIVERSITY'
);

-- Estado del plan
CREATE TYPE "PlanStatus" AS ENUM (
  'ACTIVE',
  'CANCELLED',
  'FINISHED'
);

-- Rol del participante en un plan
CREATE TYPE "PlanParticipantRole" AS ENUM (
  'CREATOR',
  'PARTICIPANT'
);

-- Tipo de mensaje en el chat del plan
CREATE TYPE "PlanMessageType" AS ENUM (
  'TEXT',
  'SYSTEM'
);

-- ============================================================================
-- PASO 2: CREAR TABLAS
-- ============================================================================

-- Tabla principal de planes
CREATE TABLE "plans" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "creator_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" "PlanCategory" NOT NULL,
  "date" DATE NOT NULL,
  "start_time" TIME NOT NULL,
  "end_time" TIME,
  "location_name" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "visibility" "PlanVisibility" NOT NULL DEFAULT 'UNIVERSITY',
  "max_participants" INTEGER,
  "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Constraints
  CONSTRAINT check_max_participants CHECK (max_participants IS NULL OR max_participants > 0),
  CONSTRAINT check_coordinates CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL)
  ),
  CONSTRAINT check_date_future CHECK (date >= CURRENT_DATE)
);

-- Tabla de participantes de planes
CREATE TABLE "plan_participants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "plan_id" UUID NOT NULL REFERENCES "plans"("id") ON DELETE CASCADE,
  "user_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "role" "PlanParticipantRole" NOT NULL,
  "joined_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "left_at" TIMESTAMP WITH TIME ZONE,

  -- Constraints
  CONSTRAINT unique_active_participant UNIQUE NULLS NOT DISTINCT ("plan_id", "user_id", "left_at"),
  CONSTRAINT check_left_after_joined CHECK (left_at IS NULL OR left_at > joined_at)
);

-- Tabla de mensajes del chat de planes
CREATE TABLE "plan_chat_messages" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "plan_id" UUID NOT NULL REFERENCES "plans"("id") ON DELETE CASCADE,
  "sender_id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "message" TEXT NOT NULL,
  "message_type" "PlanMessageType" NOT NULL DEFAULT 'TEXT',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PASO 3: CREAR ÍNDICES
-- ============================================================================

-- Índices para plans
CREATE INDEX idx_plans_creator ON "plans"("creator_id");
CREATE INDEX idx_plans_date ON "plans"("date");
CREATE INDEX idx_plans_category ON "plans"("category");
CREATE INDEX idx_plans_status ON "plans"("status");
CREATE INDEX idx_plans_visibility ON "plans"("visibility");
CREATE INDEX idx_plans_location ON "plans"("latitude", "longitude") WHERE latitude IS NOT NULL;

-- Índices para plan_participants
CREATE INDEX idx_plan_participants_plan ON "plan_participants"("plan_id");
CREATE INDEX idx_plan_participants_user ON "plan_participants"("user_id");
CREATE INDEX idx_plan_participants_active ON "plan_participants"("plan_id", "user_id") WHERE "left_at" IS NULL;

-- Índices para plan_chat_messages
CREATE INDEX idx_plan_chat_messages_plan ON "plan_chat_messages"("plan_id", "created_at" DESC);
CREATE INDEX idx_plan_chat_messages_sender ON "plan_chat_messages"("sender_id");

-- ============================================================================
-- PASO 4: CREAR TRIGGERS
-- ============================================================================

-- Trigger para actualizar automáticamente updated_at en la tabla plans
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON "plans"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PASO 5: HABILITAR ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE "plans" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_participants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "plan_chat_messages" ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PASO 6: CREAR POLÍTICAS RLS PARA "plans"
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
-- PASO 7: CREAR POLÍTICAS RLS PARA "plan_participants"
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
-- PASO 8: CREAR POLÍTICAS RLS PARA "plan_chat_messages"
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
-- PASO 9: AGREGAR COMENTARIOS
-- ============================================================================

COMMENT ON TABLE "plans" IS 'Tabla principal de planes sociales creados por usuarios';
COMMENT ON TABLE "plan_participants" IS 'Participantes de cada plan con su rol y estado';
COMMENT ON TABLE "plan_chat_messages" IS 'Mensajes de chat asociados a cada plan';

COMMENT ON COLUMN "plans"."visibility" IS 'PUBLIC: visible para todos, UNIVERSITY: solo usuarios de la universidad';
COMMENT ON COLUMN "plans"."max_participants" IS 'NULL significa ilimitado';
COMMENT ON COLUMN "plan_participants"."left_at" IS 'NULL si el participante sigue activo';
COMMENT ON COLUMN "plan_chat_messages"."message_type" IS 'TEXT: mensaje de usuario, SYSTEM: mensaje del sistema';

-- ============================================================================
-- MIGRACIÓN COMPLETADA
-- ============================================================================

-- Verificar tablas creadas
SELECT 'Tablas creadas:' as status;
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('plans', 'plan_participants', 'plan_chat_messages')
ORDER BY table_name;

-- Verificar ENUMs creados
SELECT 'ENUMs creados:' as status;
SELECT
  t.typname as enum_name,
  array_agg(e.enumlabel ORDER BY e.enumsortorder) as values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname LIKE 'Plan%'
GROUP BY t.typname
ORDER BY t.typname;

-- Verificar políticas RLS
SELECT 'Políticas RLS creadas:' as status;
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE tablename IN ('plans', 'plan_participants', 'plan_chat_messages')
GROUP BY tablename
ORDER BY tablename;
