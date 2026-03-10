-- =====================================================
-- ESPEConnect - Supabase Migration
-- Step 3: Create Triggers for updatedAt
-- =====================================================
-- This script creates triggers to automatically update the updatedAt column
-- whenever a record is modified
-- Owner: postgres
-- =====================================================

-- =====================================================
-- Create the trigger function
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

ALTER FUNCTION update_updated_at_column() OWNER TO postgres;
COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically update updatedAt timestamp on row modification';

-- =====================================================
-- Apply triggers to all tables with updatedAt column
-- =====================================================

-- User table
CREATE TRIGGER update_user_updated_at
  BEFORE UPDATE ON "User"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Banner table
CREATE TRIGGER update_banner_updated_at
  BEFORE UPDATE ON "Banner"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Establishment table
CREATE TRIGGER update_establishment_updated_at
  BEFORE UPDATE ON "Establishment"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Promotion table
CREATE TRIGGER update_promotion_updated_at
  BEFORE UPDATE ON "Promotion"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Career table
CREATE TRIGGER update_career_updated_at
  BEFORE UPDATE ON "Career"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trip table
CREATE TRIGGER update_trip_updated_at
  BEFORE UPDATE ON "Trip"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Event table
CREATE TRIGGER update_event_updated_at
  BEFORE UPDATE ON "Event"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comment table
CREATE TRIGGER update_comment_updated_at
  BEFORE UPDATE ON "Comment"
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Verification
-- =====================================================
-- To verify triggers were created successfully, run:
-- SELECT trigger_name, event_object_table
-- FROM information_schema.triggers
-- WHERE trigger_schema = 'public'
-- ORDER BY event_object_table, trigger_name;
