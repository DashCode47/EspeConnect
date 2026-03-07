import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IAuthRepository } from '../repositories/auth.repository';

export class UpdateAvatarUseCase implements UseCase<string, string> {
  constructor(private repository: IAuthRepository) {}

  async execute(imageUri: string): Promise<Either<Failure, string>> {
    return this.repository.updateAvatar(imageUri);
  }
}
