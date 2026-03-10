import { create } from 'zustand';
import { AuthUser } from '../../domain/entities/auth_user.entity';
import { AuthRepositoryImpl } from '../../data/repositories/auth.repository.impl';
import { LoginData, RegisterData } from '../../domain/repositories/auth.repository';
import { LoginUseCase } from '../../domain/usecases/login.usecase';
import { RegisterUseCase } from '../../domain/usecases/register.usecase';
import { LogoutUseCase } from '../../domain/usecases/logout.usecase';
import { GetCurrentUserUseCase } from '../../domain/usecases/get_current_user.usecase';
import { UpdateProfileUseCase } from '../../domain/usecases/update_profile.usecase';
import { UpdateAvatarUseCase } from '../../domain/usecases/update_avatar.usecase';
import { NoParams } from '../../../../core/usecase/usecase';

const repository = new AuthRepositoryImpl();
const loginUseCase = new LoginUseCase(repository);
const registerUseCase = new RegisterUseCase(repository);
const logoutUseCase = new LogoutUseCase(repository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(repository);
const updateProfileUseCase = new UpdateProfileUseCase(repository);
const updateAvatarUseCase = new UpdateAvatarUseCase(repository);

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  updateAvatar: (params: { base64: string; fileExt: string }) => Promise<string>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    const result = await loginUseCase.execute(data);
    if (result.isRight()) {
      set({ user: result.value, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
      throw new Error(result.value.message);
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    const result = await registerUseCase.execute(data);
    if (result.isRight()) {
      set({ user: result.value, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
      throw new Error(result.value.message);
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    const result = await logoutUseCase.execute(new NoParams());
    if (result.isRight()) {
      set({ user: null, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    const result = await getCurrentUserUseCase.execute(new NoParams());
    if (result.isRight()) {
      set({ user: result.value, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<AuthUser>) => {
    set({ isLoading: true, error: null });
    const result = await updateProfileUseCase.execute(data);
    if (result.isRight()) {
      set({ user: result.value, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
      throw new Error(result.value.message);
    }
  },

  updateAvatar: async (params: { base64: string; fileExt: string }) => {
    set({ isLoading: true, error: null });
    const result = await updateAvatarUseCase.execute(params);
    if (result.isRight()) {
      // Refresh user so avatarUrl in store reflects the new photo
      const userResult = await getCurrentUserUseCase.execute(new NoParams());
      if (userResult.isRight()) set({ user: userResult.value, isLoading: false });
      else set({ isLoading: false });
      return result.value;
    } else {
      set({ error: result.value.message, isLoading: false });
      throw new Error(result.value.message);
    }
  },

  clearError: () => set({ error: null }),
}));
