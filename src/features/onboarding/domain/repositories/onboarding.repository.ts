import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';

export interface IOnboardingRepository {
  completeOnboarding(): Promise<Either<Failure, void>>;
  isOnboardingCompleted(): Promise<Either<Failure, boolean>>;
}
