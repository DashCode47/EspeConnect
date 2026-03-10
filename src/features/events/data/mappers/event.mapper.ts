import { Event, EventCategory } from '../../domain/entities/event.entity';
import { EventRow } from '../models/event.model';

export class EventMapper {
  static toEntity(
    row: EventRow,
    attendeesCount: number = 0,
    isAttending: boolean = false
  ): Event {
    return {
      id: row.id,
      title: row.nombre,
      description: row.descripcion,
      category: row.categoria as EventCategory,
      startTime: row.fecha_inicio,
      endTime: row.fecha_fin,
      location: row.ubicacion,
      price: Number(row.precio) ?? 0,
      creatorId: row.creado_por,
      imageUrl: row.imagen,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      attendeesCount,
      isAttending,
      creator: {
        id: row.creado_por,
        name: row.profiles?.full_name ?? '',
        email: '',
        avatarUrl: row.profiles?.avatar_url ?? null,
        career: row.profiles?.career ?? '',
      },
    };
  }
}
