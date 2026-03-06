export interface TripRow {
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
}

export interface TripRequestRow {
  id: string;
  trip_id: string;
  passenger_id: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null; career: string | null } | null;
}

export interface RatingRow {
  id: string;
  trip_id: string;
  rater_id: string;
  driver_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { full_name: string | null; avatar_url: string | null } | null;
}
