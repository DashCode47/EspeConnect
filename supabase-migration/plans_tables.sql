-- ============================================================================
-- TABLAS para el sistema de Planes
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
-- ÍNDICES para mejorar rendimiento
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
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE "plans" IS 'Tabla principal de planes sociales creados por usuarios';
COMMENT ON TABLE "plan_participants" IS 'Participantes de cada plan con su rol y estado';
COMMENT ON TABLE "plan_chat_messages" IS 'Mensajes de chat asociados a cada plan';

COMMENT ON COLUMN "plans"."visibility" IS 'PUBLIC: visible para todos, UNIVERSITY: solo usuarios de la universidad';
COMMENT ON COLUMN "plans"."max_participants" IS 'NULL significa ilimitado';
COMMENT ON COLUMN "plan_participants"."left_at" IS 'NULL si el participante sigue activo';
COMMENT ON COLUMN "plan_chat_messages"."message_type" IS 'TEXT: mensaje de usuario, SYSTEM: mensaje del sistema';
