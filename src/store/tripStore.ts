import { create } from 'zustand';
import { tripService, Trip, GetTripsParams } from '../services/trip.service';

interface TripStore {
  // Public trips list (search/browse)
  trips: Trip[];
  tripsLoading: boolean;

  // My trips (offer mode in RidesScreen + MyTripsScreen)
  myTrips: Trip[];
  myTripsLoading: boolean;

  // Actions - public trips
  fetchTrips: (params?: GetTripsParams) => Promise<void>;

  // Actions - my trips
  fetchMyTrips: (userId: string) => Promise<void>;

  // Mutations that affect the lists
  joinTrip: (tripId: string) => Promise<void>;
  cancelTrip: (tripId: string) => Promise<void>;

  // Confirm/reject passenger (ManageTripRequestsScreen)
  // These mutate a single trip's requests — we update it in-place
  confirmPassenger: (tripId: string, requestId: string) => Promise<void>;
  rejectRequest: (tripId: string, requestId: string) => Promise<void>;

  // Update a single trip in both lists (used after detail refetch)
  updateTripInStore: (trip: Trip) => void;

  // Fetch a single trip by ID (updates state in lists too)
  fetchTripById: (tripId: string) => Promise<Trip>;
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  tripsLoading: false,
  myTrips: [],
  myTripsLoading: false,

  // ─── Public trips ─────────────────────────────────────────────────────────────

  fetchTrips: async (params?: GetTripsParams) => {
    set({ tripsLoading: true });
    try {
      const response = await tripService.getTrips({ page: 1, limit: 20, ...params });
      set({ trips: response.data.trips, tripsLoading: false });
    } catch (error) {
      console.error('Error fetching trips:', error);
      set({ tripsLoading: false });
    }
  },

  // ─── My trips ─────────────────────────────────────────────────────────────────

  fetchMyTrips: async (userId: string) => {
    set({ myTripsLoading: true });
    try {
      const response = await tripService.getUserTrips(userId, { type: 'created' });
      set({ myTrips: response.data.trips, myTripsLoading: false });
    } catch (error) {
      console.error('Error fetching my trips:', error);
      set({ myTripsLoading: false });
    }
  },

  // ─── Mutations ────────────────────────────────────────────────────────────────

  joinTrip: async (tripId: string) => {
    await tripService.joinTrip(tripId);
    // Refresh the public list so seat counts update for anyone browsing
    get().fetchTrips();
  },

  cancelTrip: async (tripId: string) => {
    await tripService.cancelTrip(tripId);
    get().fetchTrips();
    const { myTrips } = get();
    // Optimistically mark as cancelled in myTrips without a full refetch
    set({
      myTrips: myTrips.map(t =>
        t.id === tripId ? { ...t, status: 'CANCELLED' as const } : t
      ),
    });
  },

  confirmPassenger: async (tripId: string, requestId: string) => {
    const result = await tripService.confirmPassenger(tripId, { requestId });
    // Refresh trip detail in lists if present
    if (result.data.trip) {
      get().updateTripInStore(result.data.trip);
    }
  },

  rejectRequest: async (tripId: string, requestId: string) => {
    await tripService.rejectRequest(tripId, requestId);
    // Remove the request optimistically from the trip in store
    set(state => ({
      trips: state.trips.map(t => {
        if (t.id !== tripId || !t.requests) return t;
        return { ...t, requests: t.requests.filter(r => r.id !== requestId) };
      }),
      myTrips: state.myTrips.map(t => {
        if (t.id !== tripId || !t.requests) return t;
        return { ...t, requests: t.requests.filter(r => r.id !== requestId) };
      }),
    }));
  },

  // ─── Single trip update ───────────────────────────────────────────────────────

  updateTripInStore: (trip: Trip) => {
    set(state => ({
      trips: state.trips.map(t => (t.id === trip.id ? trip : t)),
      myTrips: state.myTrips.map(t => (t.id === trip.id ? trip : t)),
    }));
  },

  fetchTripById: async (tripId: string) => {
    const response = await tripService.getTripById(tripId);
    const trip = response.data.trip;
    get().updateTripInStore(trip);
    return trip;
  },
}));
