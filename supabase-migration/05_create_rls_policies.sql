-- =====================================================
-- ESPEConnect - Supabase Migration
-- Step 5: Create RLS Policies
-- =====================================================
-- This script creates Row Level Security policies for all tables
-- These policies control data access based on the authenticated user
-- Owner: postgres
-- =====================================================

-- =====================================================
-- User Table Policies
-- =====================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON "User" FOR SELECT
  USING (auth.uid()::text = id::text);

-- Users can view profiles that are visible
CREATE POLICY "Users can view visible profiles"
  ON "User" FOR SELECT
  USING ("isVisible" = true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON "User" FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can insert own profile"
  ON "User" FOR INSERT
  WITH CHECK (auth.uid()::text = id::text);

-- =====================================================
-- Connection Table Policies
-- =====================================================

-- Users can view their own connections
CREATE POLICY "Users can view own connections"
  ON "Connection" FOR SELECT
  USING (
    auth.uid()::text = "user1Id"::text OR
    auth.uid()::text = "user2Id"::text
  );

-- Users can create connections (matches)
CREATE POLICY "Users can create connections"
  ON "Connection" FOR INSERT
  WITH CHECK (
    auth.uid()::text = "user1Id"::text OR
    auth.uid()::text = "user2Id"::text
  );

-- =====================================================
-- UserInteraction Table Policies (Likes/Dislikes)
-- =====================================================

-- Users can view their own interactions
CREATE POLICY "Users can view own interactions"
  ON "UserInteraction" FOR SELECT
  USING (auth.uid()::text = "user1Id"::text);

-- Users can create interactions
CREATE POLICY "Users can create interactions"
  ON "UserInteraction" FOR INSERT
  WITH CHECK (auth.uid()::text = "user1Id"::text);

-- =====================================================
-- Message Table Policies
-- =====================================================

-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
  ON "Message" FOR SELECT
  USING (
    auth.uid()::text = "senderId"::text OR
    auth.uid()::text = "receiverId"::text
  );

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON "Message" FOR INSERT
  WITH CHECK (auth.uid()::text = "senderId"::text);

-- =====================================================
-- Post Table Policies
-- =====================================================

-- All authenticated users can view posts
CREATE POLICY "Authenticated users can view posts"
  ON "Post" FOR SELECT
  TO authenticated
  USING (true);

-- Users can create posts
CREATE POLICY "Users can create posts"
  ON "Post" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "authorId"::text);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON "Post" FOR UPDATE
  USING (auth.uid()::text = "authorId"::text);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON "Post" FOR DELETE
  USING (auth.uid()::text = "authorId"::text);

-- =====================================================
-- PostReaction Table Policies
-- =====================================================

-- All authenticated users can view reactions
CREATE POLICY "Authenticated users can view reactions"
  ON "PostReaction" FOR SELECT
  TO authenticated
  USING (true);

-- Users can create their own reactions
CREATE POLICY "Users can create reactions"
  ON "PostReaction" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "userId"::text);

-- Users can delete their own reactions
CREATE POLICY "Users can delete own reactions"
  ON "PostReaction" FOR DELETE
  USING (auth.uid()::text = "userId"::text);

-- =====================================================
-- Comment Table Policies
-- =====================================================

-- All authenticated users can view comments
CREATE POLICY "Authenticated users can view comments"
  ON "Comment" FOR SELECT
  TO authenticated
  USING (true);

-- Users can create comments
CREATE POLICY "Users can create comments"
  ON "Comment" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "authorId"::text);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON "Comment" FOR UPDATE
  USING (auth.uid()::text = "authorId"::text);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON "Comment" FOR DELETE
  USING (auth.uid()::text = "authorId"::text);

-- =====================================================
-- Report Table Policies
-- =====================================================

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON "Report" FOR SELECT
  USING (auth.uid()::text = "reporterId"::text);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON "Report" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "reporterId"::text);

-- =====================================================
-- Notification Table Policies
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON "Notification" FOR SELECT
  USING (auth.uid()::text = "userId"::text);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON "Notification" FOR UPDATE
  USING (auth.uid()::text = "userId"::text);

-- System can create notifications for any user
-- Note: This will be handled by backend/Edge Functions with service role key
CREATE POLICY "System can create notifications"
  ON "Notification" FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =====================================================
-- Banner Table Policies (Public Read)
-- =====================================================

-- Active banners are public (readable by anyone)
CREATE POLICY "Active banners are public"
  ON "Banner" FOR SELECT
  USING ("isActive" = true);

-- Only authenticated users can manage banners (should be admin only in production)
CREATE POLICY "Authenticated users can manage banners"
  ON "Banner" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Establishment Table Policies (Public Read)
-- =====================================================

-- Active establishments are public
CREATE POLICY "Active establishments are public"
  ON "Establishment" FOR SELECT
  USING ("isActive" = true);

-- Only authenticated users can manage establishments
CREATE POLICY "Authenticated users can manage establishments"
  ON "Establishment" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Promotion Table Policies (Public Read)
-- =====================================================

-- Active promotions are public
CREATE POLICY "Active promotions are public"
  ON "Promotion" FOR SELECT
  USING ("isActive" = true);

-- Only authenticated users can manage promotions
CREATE POLICY "Authenticated users can manage promotions"
  ON "Promotion" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Career Table Policies (Public Read)
-- =====================================================

-- Active careers are readable by authenticated users
CREATE POLICY "Authenticated users can view active careers"
  ON "Career" FOR SELECT
  TO authenticated
  USING ("isActive" = true);

-- Only authenticated users can manage careers (should be admin only)
CREATE POLICY "Authenticated users can manage careers"
  ON "Career" FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- Trip Table Policies
-- =====================================================

-- Active trips are viewable by all authenticated users
CREATE POLICY "Authenticated users can view active trips"
  ON "Trip" FOR SELECT
  TO authenticated
  USING ("status" = 'ACTIVE');

-- Users can view their own trips regardless of status
CREATE POLICY "Users can view own trips"
  ON "Trip" FOR SELECT
  USING (auth.uid()::text = "driverId"::text);

-- Users can create trips as drivers
CREATE POLICY "Users can create trips"
  ON "Trip" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "driverId"::text);

-- Users can update their own trips
CREATE POLICY "Users can update own trips"
  ON "Trip" FOR UPDATE
  USING (auth.uid()::text = "driverId"::text);

-- Users can delete their own trips
CREATE POLICY "Users can delete own trips"
  ON "Trip" FOR DELETE
  USING (auth.uid()::text = "driverId"::text);

-- =====================================================
-- TripRequest Table Policies
-- =====================================================

-- Users can view requests for their trips (if they're the driver)
CREATE POLICY "Drivers can view requests for their trips"
  ON "TripRequest" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Trip"
      WHERE "Trip"."id" = "TripRequest"."tripId"
      AND "Trip"."driverId"::text = auth.uid()::text
    )
  );

-- Users can view their own trip requests
CREATE POLICY "Users can view own trip requests"
  ON "TripRequest" FOR SELECT
  USING (auth.uid()::text = "passengerId"::text);

-- Users can create trip requests as passengers
CREATE POLICY "Users can create trip requests"
  ON "TripRequest" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "passengerId"::text);

-- Drivers can update requests for their trips
CREATE POLICY "Drivers can update requests for their trips"
  ON "TripRequest" FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "Trip"
      WHERE "Trip"."id" = "TripRequest"."tripId"
      AND "Trip"."driverId"::text = auth.uid()::text
    )
  );

-- =====================================================
-- TripRating Table Policies
-- =====================================================

-- Users can view ratings for trips they were involved in
CREATE POLICY "Users can view relevant ratings"
  ON "TripRating" FOR SELECT
  USING (
    auth.uid()::text = "raterId"::text OR
    auth.uid()::text = "driverId"::text
  );

-- Users can create ratings for trips they joined
CREATE POLICY "Users can create ratings"
  ON "TripRating" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "raterId"::text);

-- =====================================================
-- Event Table Policies
-- =====================================================

-- All authenticated users can view events
CREATE POLICY "Authenticated users can view events"
  ON "Event" FOR SELECT
  TO authenticated
  USING (true);

-- Users can create events
CREATE POLICY "Users can create events"
  ON "Event" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "creadoPor"::text);

-- Users can update their own events
CREATE POLICY "Users can update own events"
  ON "Event" FOR UPDATE
  USING (auth.uid()::text = "creadoPor"::text);

-- Users can delete their own events
CREATE POLICY "Users can delete own events"
  ON "Event" FOR DELETE
  USING (auth.uid()::text = "creadoPor"::text);

-- =====================================================
-- EventAttendance Table Policies
-- =====================================================

-- Users can view attendance for events they created
CREATE POLICY "Event creators can view attendance"
  ON "EventAttendance" FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "Event"
      WHERE "Event"."id" = "EventAttendance"."eventId"
      AND "Event"."creadoPor"::text = auth.uid()::text
    )
  );

-- Users can view their own event attendance
CREATE POLICY "Users can view own attendance"
  ON "EventAttendance" FOR SELECT
  USING (auth.uid()::text = "userId"::text);

-- Users can register attendance for events
CREATE POLICY "Users can register event attendance"
  ON "EventAttendance" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "userId"::text);

-- Users can cancel their own attendance
CREATE POLICY "Users can cancel own attendance"
  ON "EventAttendance" FOR DELETE
  USING (auth.uid()::text = "userId"::text);

-- =====================================================
-- Verification
-- =====================================================
-- To verify all policies were created successfully, run:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, policyname;
