import AsyncStorage from '@react-native-async-storage/async-storage';
import { Either, right, left } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IOnboardingRepository } from '../../domain/repositories/onboarding.repository';
import { ONBOARDING_COMPLETED_KEY } from '../../domain/entities/onboarding_step.entity';

export class OnboardingRepositoryImpl implements IOnboardingRepository {
  async completeOnboarding(): Promise<Either<Failure, void>> {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      return right(undefined);
    } catch (error: any) {
      return left({ message: error.message || 'Error al completar el onboarding' });
    }
  }

  async isOnboardingCompleted(): Promise<Either<Failure, boolean>> {
    try {
      const value = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      return right(value === 'true');
    } catch (error: any) {
      return left({ message: error.message || 'Error al obtener estado del onboarding' });
    }
  }
}
