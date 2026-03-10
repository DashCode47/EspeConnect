import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { AuthUser } from '../entities/auth_user.entity';
import { IAuthRepository, LoginData } from '../repositories/auth.repository';

export class LoginUseCase implements UseCase<AuthUser, LoginData> {
  constructor(private repository: IAuthRepository) {}

  async execute(params: LoginData): Promise<Either<Failure, AuthUser>> {
    return this.repository.login(params);
  }
}
