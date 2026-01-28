-- =====================================================
-- ESPEConnect - Supabase Migration
-- Step 6: Create Storage Buckets and Policies
-- =====================================================
-- This script creates storage buckets for file uploads
-- and configures their security policies
-- Owner: postgres
-- =====================================================

-- =====================================================
-- Create Storage Buckets
-- =====================================================

-- Avatars bucket (user profile pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Posts bucket (images for posts - confessions, marketplace, lost & found)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Events bucket (images for events)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events',
  'events',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Banners bucket (promotional banners)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Establishments bucket (images for establishments and promotions)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'establishments',
  'establishments',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
);

-- Careers bucket (PDF files for curriculum and career documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'careers',
  'careers',
  true,
  10485760, -- 10MB limit for PDFs
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
);

-- =====================================================
-- Storage Policies for Avatars Bucket
-- =====================================================

-- Anyone can view avatars (public bucket)
CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- Storage Policies for Posts Bucket
-- =====================================================

-- Anyone can view post images (public bucket)
CREATE POLICY "Post images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

-- Authenticated users can upload post images
CREATE POLICY "Authenticated users can upload post images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own post images
CREATE POLICY "Users can update own post images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own post images
CREATE POLICY "Users can delete own post images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- Storage Policies for Events Bucket
-- =====================================================

-- Anyone can view event images (public bucket)
CREATE POLICY "Event images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'events');

-- Authenticated users can upload event images
CREATE POLICY "Authenticated users can upload event images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'events' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can update their own event images
CREATE POLICY "Users can update own event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'events' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Users can delete their own event images
CREATE POLICY "Users can delete own event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'events' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- =====================================================
-- Storage Policies for Banners Bucket
-- =====================================================

-- Anyone can view banners (public bucket)
CREATE POLICY "Banners are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Authenticated users can manage banners (should be admin only in production)
CREATE POLICY "Authenticated users can upload banners"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

CREATE POLICY "Authenticated users can update banners"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can delete banners"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'banners');

-- =====================================================
-- Storage Policies for Establishments Bucket
-- =====================================================

-- Anyone can view establishment images (public bucket)
CREATE POLICY "Establishment images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'establishments');

-- Authenticated users can manage establishment images
CREATE POLICY "Authenticated users can upload establishment images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'establishments');

CREATE POLICY "Authenticated users can update establishment images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'establishments');

CREATE POLICY "Authenticated users can delete establishment images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'establishments');

-- =====================================================
-- Storage Policies for Careers Bucket
-- =====================================================

-- Anyone can view career documents (public bucket)
CREATE POLICY "Career documents are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'careers');

-- Authenticated users can manage career documents (should be admin only)
CREATE POLICY "Authenticated users can upload career documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'careers');

CREATE POLICY "Authenticated users can update career documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'careers');

CREATE POLICY "Authenticated users can delete career documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'careers');

-- =====================================================
-- Verification
-- =====================================================
-- To verify all storage buckets were created successfully, run:
-- SELECT * FROM storage.buckets ORDER BY name;
--
-- To verify storage policies were created successfully, run:
-- SELECT * FROM storage.policies ORDER BY bucket_id, name;
--
-- =====================================================
-- Folder Structure Recommendations
-- =====================================================
-- avatars/
--   {userId}/avatar.{ext}
--
-- posts/
--   {userId}/{timestamp}-{random}.{ext}
--
-- events/
--   {userId}/{timestamp}-{random}.{ext}
--
-- banners/
--   {bannerId}.{ext}
--
-- establishments/
--   {establishmentId}/{type}.{ext}
--   {establishmentId}/promotions/{promotionId}.{ext}
--
-- careers/
--   {careerCode}/curriculum.pdf
--   {careerCode}/documents/{documentName}.{ext}
