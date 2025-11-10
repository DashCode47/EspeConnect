import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types based on API documentation
export type TripStatus = 'ACTIVE' | 'FULL' | 'CANCELLED';
export type TripRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';
export type UserRole = 'STUDENT' | 'DRIVER';
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
  departureTime: string; // ISO 8601 datetime
  availableSeats: number;
  price?: number | null;
  notes?: string | null;
  status: TripStatus;
  createdAt: string;
  updatedAt: string;
  driver: Driver;
  requests?: TripRequest[];
  ratings?: Rating[];
  userRole?: 'driver' | 'passenger'; // For user trips endpoint
}

export interface CreateTripData {
  origin: string;
  destination: string;
  departureTime: string; // ISO 8601 datetime string
  availableSeats: number;
  price?: number;
  notes?: string;
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
  date?: string; // YYYY-MM-DD
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
  rating: number; // 1-5
  comment?: string;
}

// API Response Types
interface TripsResponse {
  status: string;
  data: {
    trips: Trip[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface TripResponse {
  status: string;
  data: {
    trip: Trip;
  };
}

interface TripRequestResponse {
  status: string;
  message: string;
  data: {
    request: TripRequest;
  };
}

interface ConfirmPassengerResponse {
  status: string;
  message: string;
  data: {
    request: TripRequest;
    trip: Trip;
  };
}

interface RatingResponse {
  status: string;
  message: string;
  data: {
    rating: Rating;
  };
}

interface UserTripsResponse {
  status: string;
  data: {
    trips: Trip[];
  };
}

const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
    };
  } catch (error) {
    console.error('Error getting headers:', error);
    throw error;
  }
};

export const tripService = {
  // 1. Listar Viajes Activos (Público)
  async getTrips(params?: GetTripsParams) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.origin) queryParams.append('origin', params.origin);
      if (params?.destination) queryParams.append('destination', params.destination);
      if (params?.date) queryParams.append('date', params.date);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const queryString = queryParams.toString();
      const url = `/trips${queryString ? `?${queryString}` : ''}`;

      const response = await api.get<TripsResponse>(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // 2. Obtener Detalle de un Viaje (Público)
  async getTripById(id: string) {
    try {
      const response = await api.get<TripResponse>(`/trips/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // 3. Crear un Viaje (Protegido - DRIVER)
  async createTrip(data: CreateTripData) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.post<TripResponse>('/trips', data, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // 4. Actualizar un Viaje (Protegido)
  async updateTrip(id: string, data: UpdateTripData) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.put<TripResponse>(`/trips/${id}`, data, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // 5. Cancelar un Viaje (Protegido)
  async cancelTrip(id: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.delete<TripResponse>(`/trips/${id}`, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // 6. Unirse a un Viaje (Protegido)
  async joinTrip(id: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.post<TripRequestResponse>(
        `/trips/${id}/join`,
        {},
        headers
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // 7. Confirmar Pasajero (Protegido - DRIVER)
  async confirmPassenger(tripId: string, data: ConfirmPassengerData) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.post<ConfirmPassengerResponse>(
        `/trips/${tripId}/confirm`,
        data,
        headers
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // 8. Calificar Conductor (Protegido)
  async rateDriver(tripId: string, data: CreateRatingData) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.post<RatingResponse>(
        `/trips/${tripId}/rating`,
        data,
        headers
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // 9. Obtener Viajes de un Usuario (Protegido)
  async getUserTrips(userId: string, params?: GetUserTripsParams) {
    try {
      const headers = await getAuthHeaders();
      const queryParams = new URLSearchParams();
      if (params?.type) queryParams.append('type', params.type);

      const queryString = queryParams.toString();
      const url = `/users/${userId}/trips${queryString ? `?${queryString}` : ''}`;

      const response = await api.get<UserTripsResponse>(url, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },
};

