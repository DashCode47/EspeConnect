import { AuthUser } from '../../domain/entities/auth_user.entity';

export const mapProfileToAuthUser = (user: any, profile: any): AuthUser => {
  return {
    id: user.id || profile.id,
    email: user.email || profile.email || '',
    name: profile?.full_name || user.user_metadata?.full_name || '',
    career: profile?.career || user.user_metadata?.career || '',
    gender: profile?.gender || user.user_metadata?.gender || '',
    interests: profile?.interests || user.user_metadata?.interests || [],
    avatarUrl: profile?.avatar_url || null,
    bio: profile?.bio || null,
    createdAt: profile?.created_at,
    updatedAt: profile?.updated_at,
  };
};
