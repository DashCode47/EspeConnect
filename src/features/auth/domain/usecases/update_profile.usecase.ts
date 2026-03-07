import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { AuthUser } from '../entities/auth_user.entity';
import { IAuthRepository } from '../repositories/auth.repository';

export class UpdateProfileUseCase implements UseCase<AuthUser, Partial<AuthUser>> {
  constructor(private repository: IAuthRepository) {}

  async execute(params: Partial<AuthUser>): Promise<Either<Failure, AuthUser>> {
    return this.repository.updateProfile(params);
  }
}
