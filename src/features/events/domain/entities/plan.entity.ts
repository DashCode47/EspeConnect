export enum PlanCategory {
  CAFE = 'CAFE',
  FIESTA = 'FIESTA',
  ESTUDIO = 'ESTUDIO',
  DEPORTE = 'DEPORTE',
  CINE = 'CINE',
  MUSICA = 'MUSICA',
  VIAJE = 'VIAJE',
  COMIDA = 'COMIDA',
  OTRO = 'OTRO',
}

export enum PlanVisibility {
  PUBLIC = 'PUBLIC',
  UNIVERSITY = 'UNIVERSITY',
}

export enum PlanStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  FINISHED = 'FINISHED',
}

export enum PlanParticipantRole {
  CREATOR = 'CREATOR',
  PARTICIPANT = 'PARTICIPANT',
}

export enum PlanParticipantStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

export enum PlanMessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
}

export interface PlanParticipantUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

export interface PlanParticipant {
  id: string;
  planId: string;
  userId: string;
  role: PlanParticipantRole;
  status: PlanParticipantStatus;
  joinedAt: string;
  leftAt: string | null;
  user?: PlanParticipantUser;
}

export interface PlanCreator {
  id: string;
  name: string;
  avatarUrl: string | null;
  career?: string;
}

export interface Plan {
  id: string;
  creatorId: string;
  title: string;
  description: string | null;
  category: PlanCategory;
  date: string;
  startTime: string;
  endTime: string | null;
  locationName: string | null;
  latitude: number | null;
  longitude: number | null;
  visibility: PlanVisibility;
  maxParticipants: number | null;
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
  requiresApproval: boolean;
  creator?: PlanCreator;
  participants?: PlanParticipant[];
  participantsCount: number;
  isParticipating: boolean;
  isRequested: boolean;
  isCreator: boolean;
  isFull: boolean;
}

export interface PlanChatMessage {
  id: string;
  planId: string;
  senderId: string;
  message: string;
  messageType: PlanMessageType;
  createdAt: string;
  user?: PlanParticipantUser;
}
