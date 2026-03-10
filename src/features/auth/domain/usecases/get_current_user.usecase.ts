import { UseCase, NoParams } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { AuthUser } from '../entities/auth_user.entity';
import { IAuthRepository } from '../repositories/auth.repository';

export class GetCurrentUserUseCase implements UseCase<AuthUser | null, NoParams> {
  constructor(private repository: IAuthRepository) {}

  async execute(_params: NoParams): Promise<Either<Failure, AuthUser | null>> {
    return this.repository.getCurrentUser();
  }
}
