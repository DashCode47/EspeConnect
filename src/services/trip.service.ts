import { supabase } from '../lib/supabase';

// Types
export type TripStatus = 'ACTIVE' | 'FULL' | 'CANCELLED';
export type TripRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type TripType = 'created' | 'joined' | 'all';

export interface Driver {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  career: string;
  bio?: string | null;
  averageRating?: number | null;
  totalRatings: number;
}

export interface Passenger {
  id: string;
  name: string;
  avatarUrl?: string | null;
  career?: string;
}

export interface TripRequest {
  id: string;
  tripId: string;
  passengerId: string;
  status: TripRequestStatus;
  createdAt: string;
  passenger: Passenger;
}

export interface Rating {
  id: string;
  tripId: string;
  raterId: string;
  driverId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  rater: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface Trip {
  id: string;
  driverId: string;
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  price?: number | null;
  notes?: string | null;
  contactPhone?: string | null;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  driver: Driver;
  requests?: TripRequest[];
  ratings?: Rating[];
  userRole?: 'driver' | 'passenger';
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

export interface ConfirmPassengerData {
  requestId: string;
}

export interface CreateRatingData {
  rating: number;
  comment?: string;
}

type TripRow = {
  id: string;
  driver_id: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price: number | null;
  notes: string | null;
  contact_phone: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null; career: string | null } | null;
};

type TripRequestRow = {
  id: string;
  trip_id: string;
  passenger_id: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null; career: string | null } | null;
};

type RatingRow = {
  id: string;
  trip_id: string;
  rater_id: string;
  driver_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
};

function mapRowToDriver(row: TripRow): Driver {
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

function mapRowToTrip(row: TripRow, requests?: TripRequest[], ratings?: Rating[]): Trip {
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
    driver: mapRowToDriver(row),
    requests,
    ratings,
  };
}

function mapRowToTripRequest(row: TripRequestRow): TripRequest {
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

function mapRowToRating(row: RatingRow): Rating {
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

async function getTripRequests(tripId: string): Promise<TripRequest[]> {
  const { data, error } = await supabase
    .from('trip_requests')
    .select('*, profiles!passenger_id(full_name, avatar_url, career)')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapRowToTripRequest);
}

async function getTripRatings(tripId: string): Promise<Rating[]> {
  const { data, error } = await supabase
    .from('trip_ratings')
    .select('*, profiles!rater_id(full_name, avatar_url)')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []).map(mapRowToRating);
}

export const tripService = {
  async getTrips(params?: GetTripsParams) {
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
    if (error) throw error;

    const trips: Trip[] = (rows || []).map((row) => mapRowToTrip(row as TripRow));
    return {
      status: 'success',
      data: {
        trips,
        pagination: { page, limit, total: trips.length, pages: Math.ceil(trips.length / limit) || 1 },
      },
    };
  },

  async getTripById(id: string) {
    const { data: row, error } = await supabase
      .from('trips')
      .select('*, profiles!driver_id(full_name, avatar_url, career)')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!row) throw new Error('Trip not found');

    const [requests, ratings] = await Promise.all([
      getTripRequests(id),
      getTripRatings(id),
    ]);

    const trip = mapRowToTrip(row as TripRow, requests, ratings);
    return { status: 'success', data: { trip } };
  },

  async createTrip(data: CreateTripData) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');

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
        throw new Error('No se pudo crear el perfil. Por favor, completa tu perfil primero.');
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
    if (error) throw error;

    const trip = mapRowToTrip(inserted as TripRow);
    return { status: 'success', data: { trip } };
  },

  async updateTrip(id: string, data: UpdateTripData) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');

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
    if (error) throw error;

    const trip = mapRowToTrip(updated as TripRow);
    return { status: 'success', data: { trip } };
  },

  async cancelTrip(id: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');

    const { data: updated, error } = await supabase
      .from('trips')
      .update({ status: 'CANCELLED', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('driver_id', user.id)
      .select('*, profiles!driver_id(full_name, avatar_url, career)')
      .single();
    if (error) throw error;

    const trip = mapRowToTrip(updated as TripRow);
    return { status: 'success', data: { trip } };
  },

  async joinTrip(id: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');

    // Check if trip exists and has available seats
    const { data: trip, error: tripError } = await supabase
      .from('trips')
      .select('available_seats, status')
      .eq('id', id)
      .single();
    if (tripError || !trip) throw new Error('Viaje no encontrado');
    if (trip.status !== 'ACTIVE') throw new Error('El viaje no está disponible');
    if (trip.available_seats < 1) throw new Error('No hay asientos disponibles');

    // Check if request already exists
    const { data: existing } = await supabase
      .from('trip_requests')
      .select('id')
      .eq('trip_id', id)
      .eq('passenger_id', user.id)
      .maybeSingle();
    if (existing) throw new Error('Ya has solicitado unirte a este viaje');

    const { data: inserted, error } = await supabase
      .from('trip_requests')
      .insert({
        trip_id: id,
        passenger_id: user.id,
        status: 'PENDING',
      })
      .select('*, profiles!passenger_id(full_name, avatar_url, career)')
      .single();
    if (error) throw error;

    const request = mapRowToTripRequest(inserted as TripRequestRow);
    return { status: 'success', message: 'Solicitud enviada', data: { request } };
  },

  async confirmPassenger(tripId: string, data: ConfirmPassengerData) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');

    // Verify user is the driver
    const { data: trip } = await supabase
      .from('trips')
      .select('driver_id, available_seats')
      .eq('id', tripId)
      .single();
    if (!trip || trip.driver_id !== user.id) throw new Error('No autorizado');
    if (trip.available_seats < 1) throw new Error('No hay asientos disponibles');

    // Update request status
    const { data: updated, error } = await supabase
      .from('trip_requests')
      .update({ status: 'ACCEPTED' })
      .eq('id', data.requestId)
      .eq('trip_id', tripId)
      .select('*, profiles!passenger_id(full_name, avatar_url, career)')
      .single();
    if (error) throw error;

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

    const request = mapRowToTripRequest(updated as TripRequestRow);
    const { data: tripData } = await supabase
      .from('trips')
      .select('*, profiles!driver_id(full_name, avatar_url, career)')
      .eq('id', tripId)
      .single();
    const tripObj = tripData ? mapRowToTrip(tripData as TripRow) : null;

    return { status: 'success', message: 'Pasajero confirmado', data: { request, trip: tripObj } };
  },

  async rejectRequest(tripId: string, requestId: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');

    // Verify user is the driver
    const { data: trip } = await supabase
      .from('trips')
      .select('driver_id')
      .eq('id', tripId)
      .single();
    if (!trip || trip.driver_id !== user.id) throw new Error('No autorizado');

    const { data: deleted, error } = await supabase
      .from('trip_requests')
      .delete()
      .eq('id', requestId)
      .eq('trip_id', tripId)
      .select('*, profiles!passenger_id(full_name, avatar_url, career)')
      .single();
    if (error) throw error;

    const request = mapRowToTripRequest(deleted as TripRequestRow);
    return { status: 'success', message: 'Solicitud rechazada', data: { request } };
  },

  async rateDriver(tripId: string, data: CreateRatingData) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');

    // Get trip to verify passenger was accepted
    const { data: trip } = await supabase
      .from('trips')
      .select('driver_id')
      .eq('id', tripId)
      .single();
    if (!trip) throw new Error('Viaje no encontrado');

    // Check if user has an accepted request for this trip
    const { data: request } = await supabase
      .from('trip_requests')
      .select('id')
      .eq('trip_id', tripId)
      .eq('passenger_id', user.id)
      .eq('status', 'ACCEPTED')
      .maybeSingle();
    if (!request) throw new Error('Debes haber sido aceptado en el viaje para calificar');

    // Check if rating already exists
    const { data: existing } = await supabase
      .from('trip_ratings')
      .select('id')
      .eq('trip_id', tripId)
      .eq('rater_id', user.id)
      .maybeSingle();
    if (existing) throw new Error('Ya calificaste este viaje');

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
    if (error) throw error;

    const rating = mapRowToRating(inserted as RatingRow);
    return { status: 'success', message: 'Calificación enviada', data: { rating } };
  },

  async getUserTrips(userId: string, params?: GetUserTripsParams) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');
    if (user.id !== userId) throw new Error('No autorizado');

    let trips: Trip[] = [];

    if (params?.type === 'created' || !params?.type) {
      // Trips created by user
      const { data: createdRows, error: createdError } = await supabase
        .from('trips')
        .select('*, profiles!driver_id(full_name, avatar_url, career)')
        .eq('driver_id', userId)
        .order('departure_time', { ascending: false });
      if (!createdError && createdRows) {
        trips = [...trips, ...createdRows.map((r) => ({ ...mapRowToTrip(r as TripRow), userRole: 'driver' as const }))];
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
            trips = [...trips, ...joinedRows.map((r) => ({ ...mapRowToTrip(r as TripRow), userRole: 'passenger' as const }))];
          }
        }
      }
    }

    // Remove duplicates and sort
    const uniqueTrips = Array.from(new Map(trips.map((t) => [t.id, t])).values());
    uniqueTrips.sort((a, b) => new Date(b.departureTime).getTime() - new Date(a.departureTime).getTime());

    return { status: 'success', data: { trips: uniqueTrips } };
  },
};
