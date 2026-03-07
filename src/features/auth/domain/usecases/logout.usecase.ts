import { UseCase, NoParams } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IAuthRepository } from '../repositories/auth.repository';

export class LogoutUseCase implements UseCase<void, NoParams> {
  constructor(private repository: IAuthRepository) {}

  async execute(_params: NoParams): Promise<Either<Failure, void>> {
    return this.repository.logout();
  }
}
