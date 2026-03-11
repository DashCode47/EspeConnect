export interface ProfileRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  career?: string | null;
}

export interface EventRow {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  ubicacion: string;
  precio: number;
  creado_por: string;
  imagen: string | null;
  created_at: string;
  updated_at: string;
  is_acepted: boolean;
  profiles?: ProfileRow | null;
}

export interface PlanParticipantRow {
  id: string;
  plan_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string;
  left_at: string | null;
  user: ProfileRow;
}

export interface PlanRow {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  category: string;
  date: string;
  start_time: string;
  end_time: string | null;
  location_name: string | null;
  latitude: number | null;
  longitude: number | null;
  visibility: string;
  max_participants: number | null;
  status: string;
  created_at: string;
  updated_at: string;
  requires_approval: boolean;
  creator: ProfileRow;
  participants?: PlanParticipantRow[];
}

export interface PlanChatMessageRow {
  id: string;
  plan_id: string;
  sender_id: string;
  message: string;
  message_type: string;
  created_at: string;
  sender: ProfileRow | null;
}
