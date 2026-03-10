import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IAuthRepository } from '../repositories/auth.repository';

export class UpdateAvatarUseCase implements UseCase<string, { base64: string; fileExt: string }> {
  constructor(private repository: IAuthRepository) {}

  async execute(params: { base64: string; fileExt: string }): Promise<Either<Failure, string>> {
    return this.repository.updateAvatar(params);
  }
}
