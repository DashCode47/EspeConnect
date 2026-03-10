import { 
  Trip, 
  Driver, 
  TripRequest, 
  Rating, 
  TripStatus, 
  TripRequestStatus 
} from '../../domain/entities/trip.entity';
import { 
  TripRow, 
  TripRequestRow, 
  RatingRow 
} from '../models/trip.model';

export class TripMapper {
  static mapRowToDriver(row: TripRow): Driver {
    return {
      id: row.driver_id,
      name: row.profiles?.full_name || '',
      email: '', // Email not available in profiles join
      avatarUrl: row.profiles?.avatar_url || null,
      career: row.profiles?.career || '',
      bio: null, // Bio not available in profiles table
      averageRating: null,
      totalRatings: 0,
    };
  }

  static mapRowToTrip(row: TripRow, requests?: TripRequest[], ratings?: Rating[]): Trip {
    return {
      id: row.id,
      driverId: row.driver_id,
      origin: row.origin,
      destination: row.destination,
      departureTime: row.departure_time,
      availableSeats: row.available_seats,
      price: row.price ? Number(row.price) : null,
      notes: row.notes || null,
      contactPhone: row.contact_phone || null,
      status: row.status as TripStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      driver: this.mapRowToDriver(row),
      requests,
      ratings,
    };
  }

  static mapRowToTripRequest(row: TripRequestRow): TripRequest {
    return {
      id: row.id,
      tripId: row.trip_id,
      passengerId: row.passenger_id,
      status: row.status as TripRequestStatus,
      createdAt: row.created_at,
      passenger: {
        id: row.passenger_id,
        name: row.profiles?.full_name || '',
        avatarUrl: row.profiles?.avatar_url || null,
        career: row.profiles?.career || '',
      },
    };
  }

  static mapRowToRating(row: RatingRow): Rating {
    return {
      id: row.id,
      tripId: row.trip_id,
      raterId: row.rater_id,
      driverId: row.driver_id,
      rating: row.rating,
      comment: row.comment || null,
      createdAt: row.created_at,
      rater: {
        id: row.rater_id,
        name: row.profiles?.full_name || '',
        avatarUrl: row.profiles?.avatar_url || null,
      },
    };
  }
}
