import { supabase } from '../../../../lib/supabase';
import { Either, left, right } from '../../../../core/utils/either';
import { Failure, ServerFailure } from '../../../../core/errors/failure';
import { Event, EventCategory, Attendee } from '../../domain/entities/event.entity';
import { IEventRepository, GetEventsParams, CreateEventData } from '../../domain/repositories/event.repository';
import { EventMapper } from '../mappers/event.mapper';
import { EventRow } from '../models/event.model';

export class EventRepositoryImpl implements IEventRepository {
  async getEvents(params?: GetEventsParams): Promise<Either<Failure, Event[]>> {
    try {
      let query = supabase
        .from('events')
        .select('*, profiles!creado_por(full_name, avatar_url, career)')
        .order('fecha_inicio', { ascending: true });

      if (params?.category && params.category !== EventCategory.ALL) {
        query = query.eq('categoria', params.category);
      }
      if (params?.startTime) {
        query = query.gte('fecha_inicio', params.startTime);
      }
      if (params?.endTime) {
        query = query.lte('fecha_fin', params.endTime);
      }
      if (params?.location?.trim()) {
        query = query.ilike('ubicacion', `%${params.location.trim()}%`);
      }
      
      const limit = Math.min(params?.limit ?? 50, 100);
      const page = Math.max(params?.page ?? 1, 1);
      query = query.range((page - 1) * limit, page * limit - 1);

      const { data: rows, error } = await query;
      if (error) return left(new ServerFailure(error.message));

      const eventsList = (rows ?? []) as EventRow[];
      const eventIds = eventsList.map((e) => e.id);
      
      const [counts, attendingSet] = await Promise.all([
        this.getAttendeesCountByEvent(eventIds),
        supabase.auth.getUser().then(({ data: { user } }) => this.getAttendingEventIds(user?.id ?? null)),
      ]);

      const events: Event[] = eventsList.map((row) =>
        EventMapper.toEntity(
          row,
          counts[row.id] ?? 0,
          attendingSet.has(row.id)
        )
      );

      return right(events);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async getEventById(id: string): Promise<Either<Failure, Event>> {
    try {
      const { data: row, error } = await supabase
        .from('events')
        .select('*, profiles!creado_por(full_name, avatar_url, career)')
        .eq('id', id)
        .single();
      
      if (error) return left(new ServerFailure(error.message));
      if (!row) return left(new ServerFailure('Event not found'));

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

      const event = EventMapper.toEntity(row as EventRow, asistentesCount, isAttending);
      return right(event);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async createEvent(data: CreateEventData): Promise<Either<Failure, Event>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new ServerFailure('No authenticated user'));

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
          // ignore image upload failure
        }
      }

      const row = {
        nombre: data.title.trim(),
        descripcion: data.description.trim(),
        categoria: data.category,
        fecha_inicio: data.startTime,
        fecha_fin: data.endTime ?? null,
        ubicacion: data.location.trim(),
        precio: data.price ?? 0,
        creado_por: user.id,
        imagen,
      };

      const { data: inserted, error } = await supabase
        .from('events')
        .insert(row)
        .select('*, profiles!creado_por(full_name, avatar_url, career)')
        .single();
      
      if (error) return left(new ServerFailure(error.message));
      
      const event = EventMapper.toEntity(inserted as EventRow, 0, false);
      return right(event);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async updateEvent(id: string, data: Partial<CreateEventData>): Promise<Either<Failure, Event>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new ServerFailure('No authenticated user'));

      const update: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (data.title !== undefined) update.nombre = data.title;
      if (data.description !== undefined) update.descripcion = data.description;
      if (data.category !== undefined) update.categoria = data.category;
      if (data.startTime !== undefined) update.fecha_inicio = data.startTime;
      if (data.endTime !== undefined) update.fecha_fin = data.endTime;
      if (data.location !== undefined) update.ubicacion = data.location;
      if (data.price !== undefined) update.precio = data.price;

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
          // ignore
        }
      }

      const { data: updated, error } = await supabase
        .from('events')
        .update(update)
        .eq('id', id)
        .eq('creado_por', user.id)
        .select('*, profiles!creado_por(full_name, avatar_url, career)')
        .single();
      
      if (error) return left(new ServerFailure(error.message));
      
      const [countResult] = await Promise.all([
        supabase.from('event_attendees').select('id', { count: 'exact', head: true }).eq('event_id', id),
      ]);
      const { data: att } = await supabase.from('event_attendees')
        .select('id')
        .eq('event_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
        
      const event = EventMapper.toEntity(updated as EventRow, countResult.count ?? 0, !!att);
      return right(event);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async deleteEvent(id: string): Promise<Either<Failure, void>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new ServerFailure('No authenticated user'));
      
      const { error } = await supabase.from('events').delete().eq('id', id).eq('creado_por', user.id);
      if (error) return left(new ServerFailure(error.message));
      
      return right(undefined);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async attendEvent(id: string): Promise<Either<Failure, void>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new ServerFailure('No authenticated user'));
      
      const { error } = await supabase.from('event_attendees').upsert(
        { event_id: id, user_id: user.id },
        { onConflict: 'event_id,user_id' }
      );
      if (error) return left(new ServerFailure(error.message));
      
      return right(undefined);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async cancelAttendance(id: string): Promise<Either<Failure, void>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) return left(new ServerFailure('No authenticated user'));
      
      const { error } = await supabase.from('event_attendees')
        .delete()
        .eq('event_id', id)
        .eq('user_id', user.id);
        
      if (error) return left(new ServerFailure(error.message));
      
      return right(undefined);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  async getEventAttendees(id: string, page: number = 1, limit: number = 20): Promise<Either<Failure, Attendee[]>> {
    try {
      const from = (page - 1) * limit;
      const { data: rows, error } = await supabase
        .from('event_attendees')
        .select('user_id, created_at, profiles!user_id(full_name, avatar_url, career)')
        .eq('event_id', id)
        .order('created_at', { ascending: false })
        .range(from, from + limit - 1);
      
      if (error) return left(new ServerFailure(error.message));

      const attendees: Attendee[] = (rows ?? []).map((r: any) => ({
        id: r.user_id,
        name: r.profiles?.full_name ?? '',
        email: '',
        avatarUrl: r.profiles?.avatar_url ?? null,
        career: r.profiles?.career ?? '',
        attendedAt: r.created_at,
      }));

      return right(attendees);
    } catch (error: any) {
      return left(new ServerFailure(error.message));
    }
  }

  private async getAttendeesCountByEvent(eventIds: string[]): Promise<Record<string, number>> {
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

  private async getAttendingEventIds(userId: string | null): Promise<Set<string>> {
    if (!userId) return new Set();
    const { data, error } = await supabase
      .from('event_attendees')
      .select('event_id')
      .eq('user_id', userId);
    if (error) return new Set();
    return new Set((data ?? []).map((r) => r.event_id));
  }
}
