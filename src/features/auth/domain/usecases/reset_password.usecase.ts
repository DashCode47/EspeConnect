import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IAuthRepository } from '../repositories/auth.repository';

export class ResetPasswordUseCase implements UseCase<void, string> {
  constructor(private repository: IAuthRepository) {}

  async execute(newPassword: string): Promise<Either<Failure, void>> {
    return this.repository.resetPassword(newPassword);
  }
}
