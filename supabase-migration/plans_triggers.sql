-- ============================================================================
-- TRIGGERS para el sistema de Planes
-- ============================================================================

-- Nota: La función update_updated_at_column() ya existe en 03_create_triggers.sql
-- Solo necesitamos crear los triggers para la tabla "plans"

-- Trigger para actualizar automáticamente updated_at en la tabla plans
CREATE TRIGGER update_plans_updated_at
BEFORE UPDATE ON "plans"
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
