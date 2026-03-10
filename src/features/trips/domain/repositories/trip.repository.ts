import { Either } from '../../../../core/utils/either';
import { Failure } from '../../../../core/errors/failure';
import { Trip, TripType, TripRequest, Rating } from '../entities/trip.entity';

export interface GetTripsParams {
  origin?: string;
  destination?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface GetUserTripsParams {
  type?: TripType;
}

export interface CreateTripData {
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price?: number;
  notes?: string;
  contactPhone?: string;
}

export interface UpdateTripData {
  origin?: string;
  destination?: string;
  departureTime?: string;
  availableSeats?: number;
  price?: number;
  notes?: string;
}

export interface ConfirmPassengerData {
  requestId: string;
}

export interface CreateRatingData {
  rating: number;
  comment?: string;
}

export interface TripPagination {
    trips: Trip[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    }
}

export interface ITripRepository {
  getTrips(params?: GetTripsParams): Promise<Either<Failure, TripPagination>>;
  getTripById(id: string): Promise<Either<Failure, Trip>>;
  createTrip(data: CreateTripData): Promise<Either<Failure, Trip>>;
  updateTrip(id: string, data: UpdateTripData): Promise<Either<Failure, Trip>>;
  cancelTrip(id: string): Promise<Either<Failure, Trip>>;
  joinTrip(id: string): Promise<Either<Failure, { request: TripRequest }>>;
  confirmPassenger(tripId: string, data: ConfirmPassengerData): Promise<Either<Failure, { request: TripRequest; trip: Trip | null }>>;
  rejectRequest(tripId: string, requestId: string): Promise<Either<Failure, { request: TripRequest }>>;
  rateDriver(tripId: string, data: CreateRatingData): Promise<Either<Failure, { rating: Rating }>>;
  getUserTrips(userId: string, params?: GetUserTripsParams): Promise<Either<Failure, Trip[]>>;
}
