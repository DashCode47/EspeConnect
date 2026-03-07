import { create } from 'zustand';
import { AuthUser } from '../../domain/entities/auth_user.entity';
import { AuthRepositoryImpl } from '../../data/repositories/auth.repository.impl';
import { LoginData, RegisterData } from '../../domain/repositories/auth.repository';

const repository = new AuthRepositoryImpl();

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;

  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  updateAvatar: (imageUri: string) => Promise<string>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    const result = await repository.login(data);
    if (result.isRight()) {
      set({ user: result.value, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
      throw new Error(result.value.message);
    }
  },

  register: async (data: RegisterData) => {
    set({ isLoading: true, error: null });
    const result = await repository.register(data);
    if (result.isRight()) {
      set({ user: result.value, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
      throw new Error(result.value.message);
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    const result = await repository.logout();
    if (result.isRight()) {
      set({ user: null, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true, error: null });
    const result = await repository.getCurrentUser();
    if (result.isRight()) {
      set({ user: result.value, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
    }
  },

  updateProfile: async (data: Partial<AuthUser>) => {
    set({ isLoading: true, error: null });
    const result = await repository.updateProfile(data);
    if (result.isRight()) {
      set({ user: result.value, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
      throw new Error(result.value.message);
    }
  },

  updateAvatar: async (imageUri: string) => {
    set({ isLoading: true, error: null });
    const result = await repository.updateAvatar(imageUri);
    if (result.isRight()) {
      set({ isLoading: false });
      return result.value;
    } else {
      set({ error: result.value.message, isLoading: false });
      throw new Error(result.value.message);
    }
  },

  clearError: () => set({ error: null }),
}));
