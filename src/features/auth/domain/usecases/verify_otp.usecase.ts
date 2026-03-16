import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IAuthRepository } from '../repositories/auth.repository';

export interface VerifyOtpParams {
  email: string;
  token: string;
}

export class VerifyOtpUseCase implements UseCase<void, VerifyOtpParams> {
  constructor(private repository: IAuthRepository) {}

  async execute(params: VerifyOtpParams): Promise<Either<Failure, void>> {
    return this.repository.verifyOtp(params.email, params.token);
  }
}
