export enum EventCategory {
  ALL = 'ALL',
  SOCIAL = 'SOCIAL',
  ACADEMIC = 'ACADEMIC',
  PRIVATE = 'PRIVATE',
  SPORTS = 'SPORTS',
  OTHER = 'OTHER',
}

export interface EventCreator {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  career?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  startTime: string;
  endTime: string | null;
  location: string;
  price: number;
  creatorId: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  attendeesCount: number;
  isAttending: boolean;
  creator: EventCreator;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  career: string;
  attendedAt: string;
}
