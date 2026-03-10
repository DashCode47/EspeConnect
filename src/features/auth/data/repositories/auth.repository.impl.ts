import { supabase } from '../../../../lib/supabase';
import { Either, right, left } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IAuthRepository, LoginData, RegisterData } from '../../domain/repositories/auth.repository';
import { AuthUser } from '../../domain/entities/auth_user.entity';
import { mapProfileToAuthUser } from '../mappers/auth.mapper';

export class AuthRepositoryImpl implements IAuthRepository {
  async login(data: LoginData): Promise<Either<Failure, AuthUser>> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        return left({ message: error.message });
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      return right(mapProfileToAuthUser(authData.user, profile));
    } catch (error: any) {
      return left({ message: error.message || 'Error inesperado al iniciar sesión' });
    }
  }

  async register(data: RegisterData): Promise<Either<Failure, AuthUser>> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name,
            career: data.career,
            gender: data.gender,
            interests: data.interests,
          },
        },
      });

      if (authError) {
        return left({ message: authError.message });
      }

      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: data.name,
          career: data.career,
          gender: data.gender,
          interests: data.interests,
          email: data.email,
          updated_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user!.id)
        .single();

      return right(mapProfileToAuthUser(authData.user!, profile));
    } catch (error: any) {
      return left({ message: error.message || 'Error inesperado al registrarse' });
    }
  }

  async logout(): Promise<Either<Failure, void>> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) return left({ message: error.message });
      return right(undefined);
    } catch (error: any) {
      return left({ message: error.message });
    }
  }

  async getCurrentUser(): Promise<Either<Failure, AuthUser | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error) return left({ message: error.message });
      if (!user) return right(null);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return right(mapProfileToAuthUser(user, profile));
    } catch (error: any) {
      return left({ message: error.message });
    }
  }

  async isAuthenticated(): Promise<Either<Failure, boolean>> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return right(!!session);
    } catch (error: any) {
      return left({ message: error.message });
    }
  }

  async updateProfile(profileData: Partial<AuthUser>): Promise<Either<Failure, AuthUser>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        return left({ message: 'No authenticated user' });
      }

      const updateData: any = {
        id: user.id,
        updated_at: new Date().toISOString(),
      };

      if (profileData.name !== undefined) updateData.full_name = profileData.name;
      if (profileData.career !== undefined) updateData.career = profileData.career;
      if (profileData.gender !== undefined) updateData.gender = profileData.gender;
      if (profileData.bio !== undefined) updateData.bio = profileData.bio;
      if (profileData.avatarUrl !== undefined) updateData.avatar_url = profileData.avatarUrl;
      if (profileData.interests !== undefined) updateData.interests = profileData.interests;

      const { error } = await supabase.from('profiles').upsert(updateData);

      if (error) return left({ message: error.message });

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return right(mapProfileToAuthUser(user, profile));
    } catch (error: any) {
      return left({ message: error.message });
    }
  }

  async updateAvatar({ base64, fileExt }: { base64: string; fileExt: string }): Promise<Either<Failure, string>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return left({ message: 'No authenticated user' });

      const contentType = `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`;
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Decode base64 → Uint8Array — works on Android and iOS without native modules
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, bytes, {
          upsert: true,
          contentType,
        });

      if (uploadError) return left({ message: uploadError.message });

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(uploadData.path);

      const publicUrlWithCacheBust = `${publicUrl}?t=${Date.now()}`;

      await this.updateProfile({ avatarUrl: publicUrlWithCacheBust });

      return right(publicUrlWithCacheBust);
    } catch (error: any) {
      return left({ message: error.message });
    }
  }
}
