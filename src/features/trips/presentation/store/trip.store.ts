import { create } from 'zustand';
import { Trip, TripRequest } from '../../domain/entities/trip.entity';
import { GetTripsParams, CreateTripData, UpdateTripData, CreateRatingData } from '../../domain/repositories/trip.repository';
import { TripRepositoryImpl } from '../../data/repositories/trip.repository.impl';
import { JoinTripUseCase } from '../../domain/usecases/join_trip.usecase';

const repository = new TripRepositoryImpl();
const joinTripUseCase = new JoinTripUseCase(repository);

interface TripStore {
  trips: Trip[];
  tripsLoading: boolean;
  myTrips: Trip[];
  myTripsLoading: boolean;

  fetchTrips: (params?: GetTripsParams) => Promise<void>;
  fetchMyTrips: (userId: string) => Promise<void>;
  joinTrip: (tripId: string) => Promise<void>;
  cancelTrip: (tripId: string) => Promise<void>;
  confirmPassenger: (tripId: string, requestId: string) => Promise<void>;
  rejectRequest: (tripId: string, requestId: string) => Promise<void>;
  updateTripInStore: (trip: Trip) => void;
  fetchTripById: (tripId: string) => Promise<Trip | null>;
  createTrip: (data: CreateTripData) => Promise<void>;
  updateTrip: (tripId: string, data: UpdateTripData) => Promise<void>;
  rateDriver: (tripId: string, data: CreateRatingData) => Promise<void>;
}

export const useTripStore = create<TripStore>((set, get) => ({
  trips: [],
  tripsLoading: false,
  myTrips: [],
  myTripsLoading: false,

  fetchTrips: async (params?: GetTripsParams) => {
    set({ tripsLoading: true });
    const result = await repository.getTrips({ page: 1, limit: 20, ...params });
    if (result.isRight()) {
      set({ trips: result.value.trips, tripsLoading: false });
    } else {
      console.error('Error fetching trips:', result.value.message);
      set({ tripsLoading: false });
    }
  },

  fetchMyTrips: async (userId: string) => {
    set({ myTripsLoading: true });
    const result = await repository.getUserTrips(userId, { type: 'created' });
    if (result.isRight()) {
      set({ myTrips: result.value, myTripsLoading: false });
    } else {
      console.error('Error fetching my trips:', result.value.message);
      set({ myTripsLoading: false });
    }
  },

  joinTrip: async (tripId: string) => {
    const result = await joinTripUseCase.execute(tripId);
    if (result.isRight()) {
      get().fetchTrips();
    } else {
      throw new Error(result.value.message);
    }
  },

  cancelTrip: async (tripId: string) => {
    const result = await repository.cancelTrip(tripId);
    if (result.isRight()) {
      get().fetchTrips();
      const { myTrips } = get();
      set({
        myTrips: myTrips.map(t =>
          t.id === tripId ? { ...t, status: 'CANCELLED' as const } : t
        ),
      });
    } else {
      throw new Error(result.value.message);
    }
  },

  confirmPassenger: async (tripId: string, requestId: string) => {
    const result = await repository.confirmPassenger(tripId, { requestId });
    if (result.isRight()) {
      const { trip } = result.value;
      if (trip) get().updateTripInStore(trip);
    } else {
      throw new Error(result.value.message);
    }
  },

  rejectRequest: async (tripId: string, requestId: string) => {
    const result = await repository.rejectRequest(tripId, requestId);
    if (result.isRight()) {
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
    } else {
      throw new Error(result.value.message);
    }
  },

  updateTripInStore: (trip: Trip) => {
    set(state => ({
      trips: state.trips.map(t => (t.id === trip.id ? trip : t)),
      myTrips: state.myTrips.map(t => (t.id === trip.id ? trip : t)),
    }));
  },

  fetchTripById: async (tripId: string) => {
    const result = await repository.getTripById(tripId);
    if (result.isRight()) {
      const trip = result.value;
      get().updateTripInStore(trip);
      return trip;
    } else {
      console.error('Error fetching trip by id:', result.value.message);
      return null;
    }
  },
  createTrip: async (data: CreateTripData) => {
    const result = await repository.createTrip(data);
    if (result.isRight()) {
      get().fetchTrips();
    } else {
      throw new Error(result.value.message);
    }
  },
  updateTrip: async (tripId: string, data: UpdateTripData) => {
    const result = await repository.updateTrip(tripId, data);
    if (result.isRight()) {
      get().updateTripInStore(result.value);
    } else {
      throw new Error(result.value.message);
    }
  },
  rateDriver: async (tripId: string, data: CreateRatingData) => {
    const result = await repository.rateDriver(tripId, data);
    if (result.isLeft()) {
      throw new Error(result.value.message);
    }
  },
}));
