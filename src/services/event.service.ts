import { supabase } from '../lib/supabase';

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
  nombre: string;
  descripcion: string;
  categoria: EventCategory;
  fechaInicio: string;
  fechaFin: string | null;
  ubicacion: string;
  precio: number;
  creadoPor: string;
  imagen: string | null;
  createdAt: string;
  updatedAt: string;
  asistentesCount: number;
  isAttending: boolean;
  creador: EventCreator;
}

interface GetEventsParams {
  categoria?: EventCategory;
  fechaInicio?: string;
  fechaFin?: string;
  ubicacion?: string;
  page?: number;
  limit?: number;
}

interface CreateEventData {
  nombre: string;
  descripcion: string;
  categoria: EventCategory;
  fechaInicio: string;
  fechaFin?: string | null;
  ubicacion: string;
  precio?: number;
  image?: { uri: string; type?: string; fileName?: string } | null;
}

interface UpdateEventData {
  nombre?: string;
  descripcion?: string;
  categoria?: EventCategory;
  fechaInicio?: string;
  fechaFin?: string | null;
  ubicacion?: string;
  precio?: number;
  image?: { uri: string; type?: string; fileName?: string } | null;
}

export interface Attendee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  career: string;
  attendedAt: string;
}

type EventRow = {
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
  profiles?: { full_name: string | null; avatar_url: string | null; career: string | null } | null;
};

function mapRowToEvent(
  row: EventRow,
  asistentesCount: number = 0,
  isAttending: boolean = false
): Event {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    categoria: row.categoria as EventCategory,
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    ubicacion: row.ubicacion,
    precio: Number(row.precio) ?? 0,
    creadoPor: row.creado_por,
    imagen: row.imagen,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    asistentesCount,
    isAttending,
    creador: {
      id: row.creado_por,
      name: row.profiles?.full_name ?? '',
      email: '',
      avatarUrl: row.profiles?.avatar_url ?? null,
      career: row.profiles?.career ?? '',
    },
  };
}

async function getAttendeesCountByEvent(eventIds: string[]): Promise<Record<string, number>> {
  if (eventIds.length === 0) return {};
  const { data, error } = await supabase
    .from('event_attendees')
    .select('event_id')
    .in('event_id', eventIds);
  if (error) return {};
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.event_id] = (counts[row.event_id] ?? 0) + 1;
  }
  return counts;
}

async function getAttendingEventIds(userId: string | null): Promise<Set<string>> {
  if (!userId) return new Set();
  const { data, error } = await supabase
    .from('event_attendees')
    .select('event_id')
    .eq('user_id', userId);
  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.event_id));
}

export const eventService = {
  async getEvents(params?: GetEventsParams) {
    let query = supabase
      .from('events')
      .select('*, profiles!creado_por(full_name, avatar_url, career)')
      .order('fecha_inicio', { ascending: true });

    if (params?.categoria && params.categoria !== EventCategory.ALL) {
      query = query.eq('categoria', params.categoria);
    }
    if (params?.fechaInicio) {
      query = query.gte('fecha_inicio', params.fechaInicio);
    }
    if (params?.fechaFin) {
      query = query.lte('fecha_fin', params.fechaFin);
    }
    if (params?.ubicacion?.trim()) {
      query = query.ilike('ubicacion', `%${params.ubicacion.trim()}%`);
    }
    const limit = Math.min(params?.limit ?? 50, 100);
    const page = Math.max(params?.page ?? 1, 1);
    query = query.range((page - 1) * limit, page * limit - 1);

    const { data: rows, error } = await query;
    if (error) throw error;

    const eventsList = (rows ?? []) as EventRow[];
    const eventIds = eventsList.map((e) => e.id);
    const [counts, attendingSet] = await Promise.all([
      getAttendeesCountByEvent(eventIds),
      supabase.auth.getUser().then(({ data: { user } }) => getAttendingEventIds(user?.id ?? null)),
    ]);

    const events: Event[] = eventsList.map((row) =>
      mapRowToEvent(
        row,
        counts[row.id] ?? 0,
        attendingSet.has(row.id)
      )
    );

    return {
      status: 'success',
      data: {
        events,
        pagination: { page, limit, total: events.length, pages: 1 },
      },
    };
  },

  async getEventById(id: string) {
    const { data: row, error } = await supabase
      .from('events')
      .select('*, profiles!creado_por(full_name, avatar_url, career)')
      .eq('id', id)
      .single();
    if (error) throw error;
    if (!row) throw new Error('Event not found');

    const [countResult, { data: { user } }] = await Promise.all([
      supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('event_id', id),
      supabase.auth.getUser(),
    ]);
    const asistentesCount = countResult.count ?? 0;
    let isAttending = false;
    if (user?.id) {
      const { data: att } = await supabase
        .from('event_attendees')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      isAttending = !!att;
    }

    const event = mapRowToEvent(row as EventRow, asistentesCount, isAttending);
    return { status: 'success', data: { event } };
  },

  async createEvent(data: CreateEventData) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');

    // Ensure profile exists before creating event (required for FK constraint)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();
    
    if (!existingProfile) {
      // Create profile if it doesn't exist
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuario',
        career: user.user_metadata?.career || '',
        gender: user.user_metadata?.gender || '',
        interests: user.user_metadata?.interests || [],
        email: user.email || '',
        updated_at: new Date().toISOString(),
      });
      if (profileError) {
        console.error('Error creating profile:', profileError);
        throw new Error('No se pudo crear el perfil. Por favor, completa tu perfil primero.');
      }
    }

    let imagen: string | null = null;
    if (data.image?.uri) {
      try {
        const ext = data.image.uri.split('.').pop() || 'jpg';
        const path = `${user.id}/events/${Date.now()}.${ext}`;
        const contentType = data.image.type || 'image/jpeg';
        const response = await fetch(data.image.uri);
        const blob = await response.blob();
        const { error: uploadError } = await supabase.storage
          .from('events')
          .upload(path, blob, { contentType, upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('events').getPublicUrl(path);
          imagen = urlData.publicUrl;
        }
      } catch (_) {
        // ignore image upload failure, event can still be created
      }
    }

    const row = {
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      categoria: data.categoria,
      fecha_inicio: data.fechaInicio,
      fecha_fin: data.fechaFin ?? null,
      ubicacion: data.ubicacion.trim(),
      precio: data.precio ?? 0,
      creado_por: user.id,
      imagen,
    };
    const { data: inserted, error } = await supabase.from('events').insert(row).select('*, profiles!creado_por(full_name, avatar_url, career)').single();
    if (error) throw error;
    const event = mapRowToEvent(inserted as EventRow, 0, false);
    return { status: 'success', data: { event } };
  },

  async updateEvent(id: string, data: UpdateEventData) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');

    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (data.nombre !== undefined) update.nombre = data.nombre;
    if (data.descripcion !== undefined) update.descripcion = data.descripcion;
    if (data.categoria !== undefined) update.categoria = data.categoria;
    if (data.fechaInicio !== undefined) update.fecha_inicio = data.fechaInicio;
    if (data.fechaFin !== undefined) update.fecha_fin = data.fechaFin;
    if (data.ubicacion !== undefined) update.ubicacion = data.ubicacion;
    if (data.precio !== undefined) update.precio = data.precio;

    if (data.image?.uri) {
      try {
        const ext = data.image.uri.split('.').pop() || 'jpg';
        const path = `${user.id}/events/${id}_${Date.now()}.${ext}`;
        const contentType = data.image.type || 'image/jpeg';
        const response = await fetch(data.image.uri);
        const blob = await response.blob();
        const { error: uploadError } = await supabase.storage
          .from('events')
          .upload(path, blob, { contentType, upsert: true });
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('events').getPublicUrl(path);
          update.imagen = urlData.publicUrl;
        }
      } catch (_) {
        // ignore image upload failure
      }
    }

    const { data: updated, error } = await supabase
      .from('events')
      .update(update)
      .eq('id', id)
      .eq('creado_por', user.id)
      .select('*, profiles!creado_por(full_name, avatar_url, career)')
      .single();
    if (error) throw error;
    const [countResult] = await Promise.all([
      supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('event_id', id),
    ]);
    const { data: att } = await supabase.from('event_attendees').select('id').eq('event_id', id).eq('user_id', user.id).maybeSingle();
    const event = mapRowToEvent(updated as EventRow, countResult.count ?? 0, !!att);
    return { status: 'success', data: { event } };
  },

  async deleteEvent(id: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');
    const { error } = await supabase.from('events').delete().eq('id', id).eq('creado_por', user.id);
    if (error) throw error;
    return { status: 'success' };
  },

  async attendEvent(id: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');
    const { error } = await supabase.from('event_attendees').upsert(
      { event_id: id, user_id: user.id },
      { onConflict: 'event_id,user_id' }
    );
    if (error) throw error;
    return { status: 'success', message: 'Asistencia registrada' };
  },

  async cancelAttendance(id: string) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('No authenticated user');
    const { error } = await supabase.from('event_attendees').delete().eq('event_id', id).eq('user_id', user.id);
    if (error) throw error;
    return { status: 'success', message: 'Asistencia cancelada' };
  },

  async getEventAttendees(id: string, page: number = 1, limit: number = 20) {
    const from = (page - 1) * limit;
    const { data: rows, error } = await supabase
      .from('event_attendees')
      .select('user_id, created_at, profiles!user_id(full_name, avatar_url, career)')
      .eq('event_id', id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1);
    if (error) throw error;

    const attendees: Attendee[] = (rows ?? []).map((r: any) => ({
      id: r.user_id,
      name: r.profiles?.full_name ?? '',
      email: '', // requires admin to resolve; leave empty or add if you expose it
      avatarUrl: r.profiles?.avatar_url ?? null,
      career: r.profiles?.career ?? '',
      attendedAt: r.created_at,
    }));
    return {
      status: 'success',
      data: {
        attendees,
        pagination: { page, limit, total: attendees.length, pages: Math.ceil(attendees.length / limit) || 1 },
      },
    };
  },
};
