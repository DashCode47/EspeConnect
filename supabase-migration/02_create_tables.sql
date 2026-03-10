-- =====================================================
-- ESPEConnect - Supabase Migration
-- Step 2: Create Tables
-- =====================================================
-- This script creates all tables for the ESPEConnect database
-- Owner: postgres
-- All tables use UUID primary keys and proper foreign key relationships
-- =====================================================

-- =====================================================
-- Core Tables
-- =====================================================

-- User Table
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT UNIQUE NOT NULL,
  "password" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "career" TEXT NOT NULL,
  "gender" TEXT NOT NULL,
  "bio" TEXT,
  "avatarUrl" TEXT,
  "role" "UserRole" DEFAULT 'STUDENT',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "interests" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isVisible" BOOLEAN DEFAULT TRUE
);

ALTER TABLE "User" OWNER TO postgres;
COMMENT ON TABLE "User" IS 'Student and driver users of the ESPEConnect platform';

-- =====================================================
-- Matching & Connection Tables
-- =====================================================

-- Connection Table (Matches between users)
CREATE TABLE "Connection" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user1Id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "user2Id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("user1Id", "user2Id")
);

ALTER TABLE "Connection" OWNER TO postgres;
COMMENT ON TABLE "Connection" IS 'Mutual matches/connections between users';

-- UserInteraction Table (Likes/Dislikes)
CREATE TABLE "UserInteraction" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user1Id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "user2Id" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("user1Id", "user2Id"),
  CHECK ("type" IN ('LIKE', 'DISLIKE'))
);

ALTER TABLE "UserInteraction" OWNER TO postgres;
COMMENT ON TABLE "UserInteraction" IS 'User swipe interactions (like/dislike) for matching system';

-- =====================================================
-- Messaging Tables
-- =====================================================

-- Message Table
CREATE TABLE "Message" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "senderId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "receiverId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "connectionId" UUID REFERENCES "Connection"("id") ON DELETE SET NULL
);

ALTER TABLE "Message" OWNER TO postgres;
COMMENT ON TABLE "Message" IS 'Private messages between connected users';

-- =====================================================
-- Posts & Social Features Tables
-- =====================================================

-- Post Table
CREATE TABLE "Post" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "authorId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "type" "PostType" NOT NULL,
  "title" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "Post" OWNER TO postgres;
COMMENT ON TABLE "Post" IS 'User posts (confessions, marketplace items, lost & found)';

-- PostReaction Table
CREATE TABLE "PostReaction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "postId" UUID NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE,
  "isLike" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "PostReaction" OWNER TO postgres;
COMMENT ON TABLE "PostReaction" IS 'User reactions to posts (likes/dislikes)';

-- Comment Table
CREATE TABLE "Comment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "authorId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "postId" UUID NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE
);

ALTER TABLE "Comment" OWNER TO postgres;
COMMENT ON TABLE "Comment" IS 'Comments on posts';

-- Report Table
CREATE TABLE "Report" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "reporterId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "postId" UUID NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "Report" OWNER TO postgres;
COMMENT ON TABLE "Report" IS 'User reports of inappropriate posts';

-- =====================================================
-- Notification Table
-- =====================================================

-- Notification Table
CREATE TABLE "Notification" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "message" TEXT NOT NULL,
  "read" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "Notification" OWNER TO postgres;
COMMENT ON TABLE "Notification" IS 'User notifications for matches, messages, and events';

-- =====================================================
-- Promotional Content Tables
-- =====================================================

-- Banner Table
CREATE TABLE "Banner" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "Banner" OWNER TO postgres;
COMMENT ON TABLE "Banner" IS 'Promotional banners displayed in the app';

-- Establishment Table
CREATE TABLE "Establishment" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "address" TEXT NOT NULL,
  "phone" TEXT,
  "email" TEXT,
  "imageUrl" TEXT,
  "website" TEXT,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "Establishment" OWNER TO postgres;
CREATE INDEX "Establishment_isActive_idx" ON "Establishment"("isActive");
COMMENT ON TABLE "Establishment" IS 'Local businesses and establishments near campus';

-- Promotion Table
CREATE TABLE "Promotion" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "imageUrl" TEXT,
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
  "category" "PromotionCategory" NOT NULL,
  "discount" INTEGER DEFAULT 0,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "establishmentId" UUID NOT NULL REFERENCES "Establishment"("id") ON DELETE CASCADE
);

ALTER TABLE "Promotion" OWNER TO postgres;
CREATE INDEX "Promotion_establishmentId_idx" ON "Promotion"("establishmentId");
CREATE INDEX "Promotion_isActive_idx" ON "Promotion"("isActive");
CREATE INDEX "Promotion_startDate_idx" ON "Promotion"("startDate");
CREATE INDEX "Promotion_endDate_idx" ON "Promotion"("endDate");
COMMENT ON TABLE "Promotion" IS 'Special offers and promotions from establishments';

-- =====================================================
-- Academic Tables
-- =====================================================

-- Career Table
CREATE TABLE "Career" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "modality" TEXT NOT NULL,
  "duration" INTEGER NOT NULL,
  "schedule" TEXT NOT NULL,
  "campus" TEXT NOT NULL,
  "cesResolution" TEXT NOT NULL,
  "directorName" TEXT NOT NULL,
  "directorEmail" TEXT NOT NULL,
  "accreditations" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "mission" TEXT NOT NULL,
  "vision" TEXT NOT NULL,
  "objectives" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "graduateProfile" TEXT NOT NULL,
  "professionalProfile" TEXT NOT NULL,
  "curriculumPdfUrl" TEXT,
  "curriculumDescription" TEXT NOT NULL,
  "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "Career" OWNER TO postgres;
COMMENT ON TABLE "Career" IS 'University career/major information';

-- =====================================================
-- Carpooling/Trip Tables
-- =====================================================

-- Trip Table
CREATE TABLE "Trip" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "driverId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "origin" TEXT NOT NULL,
  "destination" TEXT NOT NULL,
  "departureTime" TIMESTAMP WITH TIME ZONE NOT NULL,
  "availableSeats" INTEGER NOT NULL,
  "price" DOUBLE PRECISION,
  "notes" TEXT,
  "status" "TripStatus" DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "Trip" OWNER TO postgres;
COMMENT ON TABLE "Trip" IS 'Carpooling trips offered by drivers';

-- TripRequest Table
CREATE TABLE "TripRequest" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tripId" UUID NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "passengerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "status" "TripRequestStatus" DEFAULT 'PENDING',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("tripId", "passengerId")
);

ALTER TABLE "TripRequest" OWNER TO postgres;
COMMENT ON TABLE "TripRequest" IS 'Passenger requests to join trips';

-- TripRating Table
CREATE TABLE "TripRating" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tripId" UUID NOT NULL REFERENCES "Trip"("id") ON DELETE CASCADE,
  "raterId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "driverId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "rating" INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("tripId", "raterId")
);

ALTER TABLE "TripRating" OWNER TO postgres;
COMMENT ON TABLE "TripRating" IS 'Passenger ratings of drivers after trips';

-- =====================================================
-- Event Tables
-- =====================================================

-- Event Table
CREATE TABLE "Event" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "nombre" TEXT NOT NULL,
  "descripcion" TEXT NOT NULL,
  "categoria" "EventCategory" NOT NULL,
  "fechaInicio" TIMESTAMP WITH TIME ZONE NOT NULL,
  "fechaFin" TIMESTAMP WITH TIME ZONE,
  "ubicacion" TEXT NOT NULL,
  "precio" DOUBLE PRECISION DEFAULT 0,
  "creadoPor" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "imagen" TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE "Event" OWNER TO postgres;
CREATE INDEX "Event_categoria_idx" ON "Event"("categoria");
CREATE INDEX "Event_fechaInicio_idx" ON "Event"("fechaInicio");
CREATE INDEX "Event_ubicacion_idx" ON "Event"("ubicacion");
COMMENT ON TABLE "Event" IS 'University and social events';

-- EventAttendance Table
CREATE TABLE "EventAttendance" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "eventId" UUID NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
  "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE("eventId", "userId")
);

ALTER TABLE "EventAttendance" OWNER TO postgres;
CREATE INDEX "EventAttendance_eventId_idx" ON "EventAttendance"("eventId");
CREATE INDEX "EventAttendance_userId_idx" ON "EventAttendance"("userId");
COMMENT ON TABLE "EventAttendance" IS 'User attendance confirmations for events';

-- =====================================================
-- Verification Queries
-- =====================================================
-- To verify all tables were created successfully, run:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
--
-- To verify ownership is postgres:
-- SELECT tablename, tableowner FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
