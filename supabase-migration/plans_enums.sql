-- ============================================================================
-- ENUMS para el sistema de Planes
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
