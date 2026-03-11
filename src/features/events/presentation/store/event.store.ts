import { create } from 'zustand';
import { Event, EventCategory, Attendee } from '../../domain/entities/event.entity';
import { EventRepositoryImpl } from '../../data/repositories/event.repository.impl';
import { GetEventsParams, CreateEventData } from '../../domain/repositories/event.repository';
import { AttendEventUseCase } from '../../domain/usecases/attend_event.usecase';
import { CancelAttendanceUseCase } from '../../domain/usecases/cancel_attendance.usecase';

const repository = new EventRepositoryImpl();
const attendEventUseCase = new AttendEventUseCase(repository);
const cancelAttendanceUseCase = new CancelAttendanceUseCase(repository);

interface EventState {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchEvents: (params?: GetEventsParams) => Promise<void>;
  fetchEventById: (id: string) => Promise<Event | null>;
  createEvent: (data: CreateEventData) => Promise<boolean>;
  updateEvent: (id: string, data: Partial<CreateEventData>) => Promise<boolean>;
  deleteEvent: (id: string) => Promise<boolean>;
  attendEvent: (id: string) => Promise<boolean>;
  cancelAttendance: (id: string) => Promise<boolean>;
  getEventAttendees: (id: string) => Promise<Attendee[]>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  isLoading: false,
  error: null,

  fetchEvents: async (params) => {
    set({ isLoading: true, error: null });
    const result = await repository.getEvents(params);
    console.log("events", result);
    result.fold(
      (failure) => set({ error: failure.message, isLoading: false }),
      (events) => set({ events, isLoading: false })
    );
  },

  fetchEventById: async (id) => {
    set({ isLoading: true, error: null });
    const result = await repository.getEventById(id);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return null;
      },
      (event) => {
        set({ isLoading: false });
        // Update specific event in list if it exists
        set((state) => ({
          events: state.events.map((e) => (e.id === event.id ? event : e)),
        }));
        return event;
      }
    );
  },

  createEvent: async (data) => {
    set({ isLoading: true, error: null });
    const result = await repository.createEvent(data);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return false;
      },
      (event) => {
        // Only add to list if it's already accepted (it won't be for new events)
        if (event.isAccepted) {
          set((state) => ({
            events: [event, ...state.events],
          }));
        }
        set({ isLoading: false });
        return true;
      }
    );
  },

  updateEvent: async (id, data) => {
    set({ isLoading: true, error: null });
    const result = await repository.updateEvent(id, data);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return false;
      },
      (event) => {
        set((state) => ({
          events: state.events.map((e) => (e.id === id ? event : e)),
          isLoading: false,
        }));
        return true;
      }
    );
  },

  deleteEvent: async (id) => {
    set({ isLoading: true, error: null });
    const result = await repository.deleteEvent(id);
    return result.fold(
      (failure) => {
        set({ error: failure.message, isLoading: false });
        return false;
      },
      () => {
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
          isLoading: false,
        }));
        return true;
      }
    );
  },

  attendEvent: async (id) => {
    const result = await attendEventUseCase.execute(id);
    if (result.isRight()) {
      await get().fetchEventById(id);
      return true;
    }
    set({ error: result.value.message });
    return false;
  },

  cancelAttendance: async (id) => {
    const result = await cancelAttendanceUseCase.execute(id);
    if (result.isRight()) {
      await get().fetchEventById(id);
      return true;
    }
    set({ error: result.value.message });
    return false;
  },

  getEventAttendees: async (id) => {
    const result = await repository.getEventAttendees(id);
    return result.fold(
      () => [],
      (attendees) => attendees
    );
  },
}));
