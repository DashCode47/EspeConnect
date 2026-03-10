-- ============================================================================
-- MIGRATION: Add manual approval support to plans
-- ============================================================================

-- 1. Add requires_approval column to plans table
ALTER TABLE "plans"
ADD COLUMN IF NOT EXISTS "requires_approval" BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Add status column to plan_participants table
--    PENDING = request sent, waiting creator approval
--    APPROVED = active participant (default for non-approval plans)
ALTER TABLE "plan_participants"
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'APPROVED'
  CHECK (status IN ('PENDING', 'APPROVED'));

-- 3. Update index for active approved participants
CREATE INDEX IF NOT EXISTS idx_plan_participants_approved
  ON "plan_participants"("plan_id", "user_id")
  WHERE "left_at" IS NULL AND "status" = 'APPROVED';

-- 4. Update RLS: only APPROVED participants can view/send chat messages
--    (PENDING participants cannot access the chat until approved)
DROP POLICY IF EXISTS "plan_chat_messages_select_policy" ON "plan_chat_messages";
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
    AND pp.status = 'APPROVED'
  )
);

DROP POLICY IF EXISTS "plan_chat_messages_insert_policy" ON "plan_chat_messages";
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
    AND pp.status = 'APPROVED'
  )
);

-- 5. Allow creator to UPDATE participant status (approve/reject)
DROP POLICY IF EXISTS "plan_participants_update_policy" ON "plan_participants";
CREATE POLICY "plan_participants_update_policy"
ON "plan_participants"
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "plans" p
    WHERE p.id = plan_id
    AND p.creator_id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM "plans" p
    WHERE p.id = plan_id
    AND p.creator_id = auth.uid()
  )
);

COMMENT ON COLUMN "plans"."requires_approval" IS 'If true, users must request to join and creator must approve';
COMMENT ON COLUMN "plan_participants"."status" IS 'PENDING: awaiting approval, APPROVED: active member';
