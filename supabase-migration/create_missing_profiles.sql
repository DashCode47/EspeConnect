-- =====================================================
-- Create missing profiles for existing auth.users
-- =====================================================
-- Run this to create profiles for users that exist in auth.users
-- but don't have a corresponding entry in public.profiles
-- =====================================================

-- Insert profiles for users that don't have one yet
INSERT INTO public.profiles (id, full_name, email, updated_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.email,
    'Usuario'
  ) AS full_name,
  au.email,
  NOW() AS updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify the results
SELECT 
  COUNT(*) FILTER (WHERE p.id IS NOT NULL) AS users_with_profiles,
  COUNT(*) FILTER (WHERE p.id IS NULL) AS users_without_profiles,
  COUNT(*) AS total_users
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id;