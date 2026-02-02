// Types for the Plans feature based on Supabase schema

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

export enum PlanMessageType {
  TEXT = 'TEXT',
  SYSTEM = 'SYSTEM',
}

// User info for participants (lightweight)
export interface PlanParticipantUser {
  id: string;
  name: string;
  avatarUrl: string | null;
}

// Plan Participant
export interface PlanParticipant {
  id: string;
  plan_id: string;
  user_id: string;
  role: PlanParticipantRole;
  joined_at: string;
  left_at: string | null;
  user?: PlanParticipantUser; // Joined data
}

// Plan Creator
export interface PlanCreator {
  id: string;
  name: string;
  avatarUrl: string | null;
  career?: string;
}

// Main Plan type
export interface Plan {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: PlanCategory;
  date: string; // ISO date string
  start_time: string; // Time string "HH:MM"
  end_time: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  visibility: PlanVisibility;
  max_participants: number | null;
  status: PlanStatus;
  created_at: string;
  updated_at: string;

  // Joined data from relations
  creator?: PlanCreator;
  participants?: PlanParticipant[];

  // Computed fields
  participantsCount?: number;
  isParticipating?: boolean;
  isCreator?: boolean;
  isFull?: boolean;
}

// Chat Message
export interface PlanChatMessage {
  id: string;
  plan_id: string;
  sender_id: string;
  message: string;
  message_type: PlanMessageType;
  created_at: string;

  // Joined data
  sender?: PlanParticipantUser;
}

// API Request/Response types
export interface CreatePlanRequest {
  title: string;
  description?: string;
  category: PlanCategory;
  date: string;
  start_time: string;
  end_time?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  visibility?: PlanVisibility;
  max_participants?: number;
}

export interface UpdatePlanRequest {
  title?: string;
  description?: string;
  category?: PlanCategory;
  date?: string;
  start_time?: string;
  end_time?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  visibility?: PlanVisibility;
  max_participants?: number;
  status?: PlanStatus;
}

export interface GetPlansParams {
  status?: PlanStatus;
  category?: PlanCategory;
  visibility?: PlanVisibility;
  date?: string; // Filter by specific date
  dateFrom?: string; // Filter from date
  dateTo?: string; // Filter to date
  limit?: number;
  offset?: number;
}

export interface SendMessageRequest {
  message: string;
  message_type?: PlanMessageType;
}
