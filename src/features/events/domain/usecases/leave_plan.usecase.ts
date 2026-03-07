import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IPlanRepository } from '../repositories/plan.repository';

export class LeavePlanUseCase implements UseCase<void, string> {
  constructor(private repository: IPlanRepository) {}

  async execute(planId: string): Promise<Either<Failure, void>> {
    return this.repository.leavePlan(planId);
  }
}
