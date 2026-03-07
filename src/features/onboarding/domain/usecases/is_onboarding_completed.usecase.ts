import { UseCase, NoParams } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IOnboardingRepository } from '../repositories/onboarding.repository';

export class IsOnboardingCompletedUseCase implements UseCase<boolean, NoParams> {
  constructor(private repository: IOnboardingRepository) {}

  async execute(_params: NoParams): Promise<Either<Failure, boolean>> {
    return this.repository.isOnboardingCompleted();
  }
}
