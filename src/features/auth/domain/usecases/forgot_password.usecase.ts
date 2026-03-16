import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IAuthRepository } from '../repositories/auth.repository';

export class ForgotPasswordUseCase implements UseCase<void, string> {
  constructor(private repository: IAuthRepository) {}

  async execute(email: string): Promise<Either<Failure, void>> {
    return this.repository.forgotPassword(email);
  }
}
