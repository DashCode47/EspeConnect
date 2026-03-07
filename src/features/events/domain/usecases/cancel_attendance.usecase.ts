import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { IEventRepository } from '../repositories/event.repository';

export class CancelAttendanceUseCase implements UseCase<void, string> {
  constructor(private repository: IEventRepository) {}

  async execute(eventId: string): Promise<Either<Failure, void>> {
    return this.repository.cancelAttendance(eventId);
  }
}
