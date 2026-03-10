import { UseCase, NoParams } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IOnboardingRepository } from '../repositories/onboarding.repository';

export class CompleteOnboardingUseCase implements UseCase<void, NoParams> {
  constructor(private repository: IOnboardingRepository) {}

  async execute(_params: NoParams): Promise<Either<Failure, void>> {
    return this.repository.completeOnboarding();
  }
}
