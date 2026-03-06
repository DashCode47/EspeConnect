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
