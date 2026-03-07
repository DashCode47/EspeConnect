import { Failure } from '../../../../core/errors/failure';
import { Either } from '../../../../core/utils/either';
import { Event, EventCategory, Attendee } from '../entities/event.entity';

export interface GetEventsParams {
  category?: EventCategory;
  startTime?: string;
  endTime?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: EventCategory;
  startTime: string;
  endTime?: string | null;
  location: string;
  price?: number;
  image?: { uri: string; type?: string; fileName?: string } | null;
}

export interface IEventRepository {
  getEvents(params?: GetEventsParams): Promise<Either<Failure, Event[]>>;
  getEventById(id: string): Promise<Either<Failure, Event>>;
  createEvent(data: CreateEventData): Promise<Either<Failure, Event>>;
  updateEvent(id: string, data: Partial<CreateEventData>): Promise<Either<Failure, Event>>;
  deleteEvent(id: string): Promise<Either<Failure, void>>;
  attendEvent(id: string): Promise<Either<Failure, void>>;
  cancelAttendance(id: string): Promise<Either<Failure, void>>;
  getEventAttendees(id: string, page?: number, limit?: number): Promise<Either<Failure, Attendee[]>>;
}
