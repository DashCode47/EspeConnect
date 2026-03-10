import { create } from 'zustand';
import { OnboardingRepositoryImpl } from '../../data/repositories/onboarding.repository.impl';
import { CompleteOnboardingUseCase } from '../../domain/usecases/complete_onboarding.usecase';
import { IsOnboardingCompletedUseCase } from '../../domain/usecases/is_onboarding_completed.usecase';
import { NoParams } from '../../../../core/usecase/usecase';

const repository = new OnboardingRepositoryImpl();
const completeOnboardingUseCase = new CompleteOnboardingUseCase(repository);
const isOnboardingCompletedUseCase = new IsOnboardingCompletedUseCase(repository);

interface OnboardingStore {
  isCompleted: boolean | null;
  isLoading: boolean;
  error: string | null;

  completeOnboarding: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  isCompleted: null,
  isLoading: false,
  error: null,

  completeOnboarding: async () => {
    set({ isLoading: true, error: null });
    const result = await completeOnboardingUseCase.execute(new NoParams());
    if (result.isRight()) {
      set({ isCompleted: true, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
    }
  },

  checkOnboardingStatus: async () => {
    set({ isLoading: true, error: null });
    const result = await isOnboardingCompletedUseCase.execute(new NoParams());
    if (result.isRight()) {
      set({ isCompleted: result.value, isLoading: false });
    } else {
      set({ error: result.value.message, isLoading: false });
    }
  },
}));
