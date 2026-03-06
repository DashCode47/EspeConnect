import { UseCase } from '../../../../core/usecase/usecase';
import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { TripRequest } from '../entities/trip.entity';
import { ITripRepository } from '../repositories/trip.repository';

export class JoinTripUseCase implements UseCase<{ request: TripRequest }, string> {
  constructor(private repository: ITripRepository) {}

  async execute(tripId: string): Promise<Either<Failure, { request: TripRequest }>> {
    return this.repository.joinTrip(tripId);
  }
}
