-- =====================================================
-- ESPEConnect - Supabase Migration
-- Step 1: Create ENUM Types
-- =====================================================
-- This script creates all ENUM types needed for the ESPEConnect database
-- Owner: postgres
-- =====================================================

-- User Roles
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'DRIVER');

-- Post Types
CREATE TYPE "PostType" AS ENUM ('CONFESSION', 'MARKETPLACE', 'LOST_AND_FOUND');

-- Promotion Categories
CREATE TYPE "PromotionCategory" AS ENUM ('FOOD', 'DRINKS', 'EVENTS', 'PARTIES', 'OTHER');

-- Trip Status
CREATE TYPE "TripStatus" AS ENUM ('ACTIVE', 'FULL', 'CANCELLED');

-- Trip Request Status
CREATE TYPE "TripRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- Event Categories
CREATE TYPE "EventCategory" AS ENUM ('SOCIAL', 'ACADEMIC', 'PRIVATE', 'SPORTS', 'OTHER');

-- =====================================================
-- Verification
-- =====================================================
-- To verify ENUMs were created successfully, run:
-- SELECT typname FROM pg_type WHERE typtype = 'e';
