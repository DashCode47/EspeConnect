import { supabase } from '../../../../lib/supabase';
import { Either, left, right } from '../../../../core/utils/either';
import { Failure, ServerFailure, AuthFailure } from '../../../../core/errors/failure';
import { 
  Trip, 
  TripRequest, 
  Rating 
} from '../../domain/entities/trip.entity';
import { 
  ITripRepository, 
  GetTripsParams, 
  TripPagination, 
  CreateTripData, 
  UpdateTripData, 
  ConfirmPassengerData, 
  CreateRatingData, 
  GetUserTripsParams 
} from '../../domain/repositories/trip.repository';
import { TripRow, TripRequestRow, RatingRow } from '../models/trip.model';
import { TripMapper } from '../mappers/trip.mapper';

export class TripRepositoryImpl implements ITripRepository {
  
  private async getTripRequests(tripId: string): Promise<TripRequest[]> {
    const { data, error } = await supabase
      .from('trip_requests')
      .select('*, profiles!passenger_id(full_name, avatar_url, career)')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(row => TripMapper.mapRowToTripRequest(row as TripRequestRow));
  }

  private async getTripRatings(tripId: string): Promise<Rating[]> {
    const { data, error } = await supabase
      .from('trip_ratings')
      .select('*, profiles!rater_id(full_name, avatar_url)')
      .eq('trip_id', tripId)
      .order('created_at', { ascending: false });
    if (error) return [];
    return (data || []).map(row => TripMapper.mapRowToRating(row as RatingRow));
  }

  async getTrips(params?: GetTripsParams): Promise<Either<Failure, TripPagination>> {
    try {
      let query = supabase
        .from('trips')
        .select('*, profiles!driver_id(full_name, avatar_url, career)')
        .eq('status', 'ACTIVE')
        .order('departure_time', { ascending: true });

      if (params?.origin?.trim()) {
        query = query.ilike('origin', `%${params.origin.trim()}%`);
      }
      if (params?.destination?.trim()) {
        query = query.ilike('destination', `%${params.destination.trim()}%`);
      }
      if (params?.date) {
        const startOfDay = new Date(params.date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(params.date);
        endOfDay.setHours(23, 59, 59, 999);
        query = query.gte('departure_time', startOfDay.toISOString());
        query = query.lte('departure_time', endOfDay.toISOString());
      }

      const limit = Math.min(params?.limit ?? 50, 100);
      const page = Math.max(params?.page ?? 1, 1);
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data: rows, error } = await query;
      if (error) return left(new ServerFailure(error.message));

      const trips: Trip[] = (rows || []).map((row) => TripMapper.mapRowToTrip(row as TripRow));
      
      return right({
        trips,
        pagination: { 
          page, 
          limit, 
          total: trips.length, 
          pages: Math.ceil(trips.length / limit) || 1 
        },
      });
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }

  async getTripById(id: string): Promise<Either<Failure, Trip>> {
    try {
      const { data: row, error } = await supabase
        .from('trips')
        .select('*, profiles!driver_id(full_name, avatar_url, career)')
        .eq('id', id)
        .single();
      
      if (error) return left(new ServerFailure(error.message));
      if (!row) return left(new ServerFailure('Trip not found'));

      const [requests, ratings] = await Promise.all([
        this.getTripRequests(id),
        this.getTripRatings(id),
      ]);

      const trip = TripMapper.mapRowToTrip(row as TripRow, requests, ratings);
      return right(trip);
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }

  async createTrip(data: CreateTripData): Promise<Either<Failure, Trip>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new AuthFailure('No authenticated user'));

      // Ensure profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      
      if (!existingProfile) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
          career: user.user_metadata?.career || '',
          gender: user.user_metadata?.gender || '',
          interests: user.user_metadata?.interests || [],
          email: user.email || '',
          updated_at: new Date().toISOString(),
        });
        if (profileError) {
          return left(new ServerFailure('No se pudo crear el perfil. Por favor, completa tu perfil primero.'));
        }
      }

      const row = {
        driver_id: user.id,
        origin: data.origin.trim(),
        destination: data.destination.trim(),
        departure_time: data.departureTime,
        available_seats: data.availableSeats,
        price: data.price ?? null,
        notes: data.notes?.trim() || null,
        contact_phone: data.contactPhone?.trim() || null,
        status: 'ACTIVE' as const,
      };

      const { data: inserted, error } = await supabase
        .from('trips')
        .insert(row)
        .select('*, profiles!driver_id(full_name, avatar_url, career)')
        .single();
      
      if (error) return left(new ServerFailure(error.message));

      const trip = TripMapper.mapRowToTrip(inserted as TripRow);
      return right(trip);
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }

  async updateTrip(id: string, data: UpdateTripData): Promise<Either<Failure, Trip>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new AuthFailure('No authenticated user'));

      const update: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (data.origin !== undefined) update.origin = data.origin.trim();
      if (data.destination !== undefined) update.destination = data.destination.trim();
      if (data.departureTime !== undefined) update.departure_time = data.departureTime;
      if (data.availableSeats !== undefined) update.available_seats = data.availableSeats;
      if (data.price !== undefined) update.price = data.price ?? null;
      if (data.notes !== undefined) update.notes = data.notes?.trim() || null;

      const { data: updated, error } = await supabase
        .from('trips')
        .update(update)
        .eq('id', id)
        .eq('driver_id', user.id)
        .select('*, profiles!driver_id(full_name, avatar_url, career)')
        .single();
      
      if (error) return left(new ServerFailure(error.message));

      const trip = TripMapper.mapRowToTrip(updated as TripRow);
      return right(trip);
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }

  async cancelTrip(id: string): Promise<Either<Failure, Trip>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new AuthFailure('No authenticated user'));

      const { data: updated, error } = await supabase
        .from('trips')
        .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('driver_id', user.id)
        .select('*, profiles!driver_id(full_name, avatar_url, career)')
        .single();
        
      if (error) return left(new ServerFailure(error.message));

      const trip = TripMapper.mapRowToTrip(updated as TripRow);
      return right(trip);
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }

  async joinTrip(id: string): Promise<Either<Failure, { request: TripRequest }>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new AuthFailure('No authenticated user'));

      // Check if trip exists and has available seats
      const { data: trip, error: tripError } = await supabase
        .from('trips')
        .select('available_seats, status')
        .eq('id', id)
        .single();
      
      if (tripError || !trip) return left(new ServerFailure('Viaje no encontrado'));
      if (trip.status !== 'ACTIVE') return left(new ServerFailure('El viaje no está disponible'));
      if (trip.available_seats < 1) return left(new ServerFailure('No hay asientos disponibles'));

      // Check if request already exists
      const { data: existing } = await supabase
        .from('trip_requests')
        .select('id')
        .eq('trip_id', id)
        .eq('passenger_id', user.id)
        .maybeSingle();
      
      if (existing) return left(new ServerFailure('Ya has solicitado unirte a este viaje'));

      const { data: inserted, error } = await supabase
        .from('trip_requests')
        .insert({
          trip_id: id,
          passenger_id: user.id,
          status: 'PENDING',
        })
        .select('*, profiles!passenger_id(full_name, avatar_url, career)')
        .single();
        
      if (error) return left(new ServerFailure(error.message));

      const request = TripMapper.mapRowToTripRequest(inserted as TripRequestRow);
      return right({ request });
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }

  async confirmPassenger(tripId: string, data: ConfirmPassengerData): Promise<Either<Failure, { request: TripRequest; trip: Trip | null }>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new AuthFailure('No authenticated user'));

      // Verify user is the driver
      const { data: trip } = await supabase
        .from('trips')
        .select('driver_id, available_seats')
        .eq('id', tripId)
        .single();
      
      if (!trip || trip.driver_id !== user.id) return left(new ServerFailure('No autorizado'));
      if (trip.available_seats < 1) return left(new ServerFailure('No hay asientos disponibles'));

      // Update request status
      const { data: updated, error } = await supabase
        .from('trip_requests')
        .update({ status: 'ACCEPTED' })
        .eq('id', data.requestId)
        .eq('trip_id', tripId)
        .select('*, profiles!passenger_id(full_name, avatar_url, career)')
        .single();
        
      if (error) return left(new ServerFailure(error.message));

      // Decrease available seats
      await supabase
        .from('trips')
        .update({ available_seats: trip.available_seats - 1, updated_at: new Date().toISOString() })
        .eq('id', tripId);

      // Update trip status if full
      if (trip.available_seats - 1 === 0) {
        await supabase
          .from('trips')
          .update({ status: 'FULL', updated_at: new Date().toISOString() })
          .eq('id', tripId);
      }

      const request = TripMapper.mapRowToTripRequest(updated as TripRequestRow);
      const { data: tripData } = await supabase
        .from('trips')
        .select('*, profiles!driver_id(full_name, avatar_url, career)')
        .eq('id', tripId)
        .single();
      const tripObj = tripData ? TripMapper.mapRowToTrip(tripData as TripRow) : null;

      return right({ request, trip: tripObj });
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }

  async rejectRequest(tripId: string, requestId: string): Promise<Either<Failure, { request: TripRequest }>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new AuthFailure('No authenticated user'));

      // Verify user is the driver
      const { data: trip } = await supabase
        .from('trips')
        .select('driver_id')
        .eq('id', tripId)
        .single();
        
      if (!trip || trip.driver_id !== user.id) return left(new ServerFailure('No autorizado'));

      const { data: deleted, error } = await supabase
        .from('trip_requests')
        .delete()
        .eq('id', requestId)
        .eq('trip_id', tripId)
        .select('*, profiles!passenger_id(full_name, avatar_url, career)')
        .single();
        
      if (error) return left(new ServerFailure(error.message));

      const request = TripMapper.mapRowToTripRequest(deleted as TripRequestRow);
      return right({ request });
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }

  async rateDriver(tripId: string, data: CreateRatingData): Promise<Either<Failure, { rating: Rating }>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new AuthFailure('No authenticated user'));

      // Get trip to verify passenger was accepted
      const { data: trip } = await supabase
        .from('trips')
        .select('driver_id')
        .eq('id', tripId)
        .single();
      if (!trip) return left(new ServerFailure('Viaje no encontrado'));

      // Check if user has an accepted request for this trip
      const { data: request } = await supabase
        .from('trip_requests')
        .select('id')
        .eq('trip_id', tripId)
        .eq('passenger_id', user.id)
        .eq('status', 'ACCEPTED')
        .maybeSingle();
        
      if (!request) return left(new ServerFailure('Debes haber sido aceptado en el viaje para calificar'));

      // Check if rating already exists
      const { data: existing } = await supabase
        .from('trip_ratings')
        .select('id')
        .eq('trip_id', tripId)
        .eq('rater_id', user.id)
        .maybeSingle();
        
      if (existing) return left(new ServerFailure('Ya calificaste este viaje'));

      const { data: inserted, error } = await supabase
        .from('trip_ratings')
        .insert({
          trip_id: tripId,
          rater_id: user.id,
          driver_id: trip.driver_id,
          rating: data.rating,
          comment: data.comment?.trim() || null,
        })
        .select('*, profiles!rater_id(full_name, avatar_url)')
        .single();
        
      if (error) return left(new ServerFailure(error.message));

      const rating = TripMapper.mapRowToRating(inserted as RatingRow);
      return right({ rating });
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }

  async getUserTrips(userId: string, params?: GetUserTripsParams): Promise<Either<Failure, Trip[]>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new AuthFailure('No authenticated user'));
      if (user.id !== userId) return left(new ServerFailure('No autorizado'));

      let trips: Trip[] = [];

      if (params?.type === 'created' || !params?.type) {
        // Trips created by user
        const { data: createdRows, error: createdError } = await supabase
          .from('trips')
          .select('*, profiles!driver_id(full_name, avatar_url, career)')
          .eq('driver_id', userId)
          .order('departure_time', { ascending: false });
          
        if (!createdError && createdRows) {
          trips = [...trips, ...createdRows.map((r) => ({ ...TripMapper.mapRowToTrip(r as TripRow), userRole: 'driver' as const }))];
        }
      }

      if (params?.type === 'joined' || params?.type === 'all') {
        // Trips user joined (accepted requests)
        const { data: requests, error: requestsError } = await supabase
          .from('trip_requests')
          .select('trip_id')
          .eq('passenger_id', userId)
          .eq('status', 'ACCEPTED');
          
        if (!requestsError && requests) {
          const tripIds = requests.map((r) => r.trip_id);
          if (tripIds.length > 0) {
            const { data: joinedRows, error: joinedError } = await supabase
              .from('trips')
              .select('*, profiles!driver_id(full_name, avatar_url, career)')
              .in('id', tripIds)
              .order('departure_time', { ascending: false });
              
            if (!joinedError && joinedRows) {
              trips = [...trips, ...joinedRows.map((r) => ({ ...TripMapper.mapRowToTrip(r as TripRow), userRole: 'passenger' as const }))];
            }
          }
        }
      }

      // Remove duplicates and sort
      const uniqueTrips = Array.from(new Map(trips.map((t) => [t.id, t])).values());
      uniqueTrips.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());

      return right(uniqueTrips);
    } catch (e: any) {
      return left(new ServerFailure(e.message));
    }
  }
}
