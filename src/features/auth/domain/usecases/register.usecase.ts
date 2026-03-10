import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { AuthUser } from '../entities/auth_user.entity';
import { IAuthRepository, RegisterData } from '../repositories/auth.repository';

export class RegisterUseCase implements UseCase<AuthUser, RegisterData> {
  constructor(private repository: IAuthRepository) {}

  async execute(params: RegisterData): Promise<Either<Failure, AuthUser>> {
    return this.repository.register(params);
  }
}
