import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  career: string;
  gender: string;
  bio: string | null;
  avatarUrl: string | null;
  interests: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface UserState {
  profile: UserProfile | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateAvatar: (imageUri: string) => Promise<string>;
  clearProfile: () => void;
  setProfile: (profile: UserProfile | null) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      if (!user) {
        set({ profile: null, isLoading: false });
        return;
      }

      // Get profile from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows found, which is ok for new users
        throw profileError;
      }

      const profile: UserProfile = {
        id: user.id,
        email: user.email || '',
        name: profileData?.full_name || user.user_metadata?.full_name || '',
        career: profileData?.career || user.user_metadata?.career || '',
        gender: profileData?.gender || user.user_metadata?.gender || '',
        bio: profileData?.bio || null,
        avatarUrl: profileData?.avatar_url || null,
        interests: profileData?.interests || user.user_metadata?.interests || [],
        createdAt: profileData?.created_at,
        updatedAt: profileData?.updated_at,
      };

      set({ profile, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      set({ error: error.message, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Map to database column names
      const updateData: any = {
        id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (data.name !== undefined) updateData.full_name = data.name;
      if (data.career !== undefined) updateData.career = data.career;
      if (data.gender !== undefined) updateData.gender = data.gender;
      if (data.bio !== undefined) updateData.bio = data.bio;
      if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
      if (data.interests !== undefined) updateData.interests = data.interests;

      const { error } = await supabase
        .from('profiles')
        .upsert(updateData);

      if (error) {
        throw error;
      }

      // Update local state
      const currentProfile = get().profile;
      if (currentProfile) {
        set({
          profile: { ...currentProfile, ...data },
          isLoading: false,
        });
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateAvatar: async (imageUri: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      const fileExt = imageUri.split('.').pop() || 'jpg';
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Create form data for upload
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: `image/${fileExt}`,
        name: `avatar.${fileExt}`,
      } as any);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, formData, {
          upsert: true,
          contentType: `image/${fileExt}`,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      // Update profile with new avatar URL
      await get().updateProfile({ avatarUrl: publicUrl });

      set({ isLoading: false });
      return publicUrl;
    } catch (error: any) {
      console.error('Error updating avatar:', error);
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  clearProfile: () => {
    set({ profile: null, error: null, isLoading: false });
  },

  setProfile: (profile: UserProfile | null) => {
    set({ profile });
  },
}));
