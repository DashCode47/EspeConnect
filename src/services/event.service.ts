import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

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
  fechaInicio: string; // ISO 8601 date-time
  fechaFin: string | null; // ISO 8601 date-time, opcional
  ubicacion: string;
  precio: number; // default: 0
  creadoPor: string; // UUID del usuario creador
  imagen: string | null; // URL pública de la imagen
  createdAt: string; // ISO 8601 date-time
  updatedAt: string; // ISO 8601 date-time
  asistentesCount: number; // número de asistentes
  isAttending: boolean; // si el usuario actual está asistiendo
  creador: EventCreator;
}

interface EventsResponse {
  status: string;
  data: {
    events: Event[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface EventResponse {
  status: string;
  data: {
    event: Event;
  };
}

interface GetEventsParams {
  categoria?: EventCategory;
  fechaInicio?: string; // ISO 8601
  fechaFin?: string; // ISO 8601
  ubicacion?: string; // búsqueda parcial
  page?: number;
  limit?: number;
}

interface CreateEventData {
  nombre: string;
  descripcion: string;
  categoria: EventCategory;
  fechaInicio: string; // ISO 8601
  fechaFin?: string | null; // ISO 8601, opcional
  ubicacion: string;
  precio?: number; // default: 0
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

interface Attendee {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  career: string;
  attendedAt: string; // ISO 8601 date-time
}

interface AttendeesResponse {
  status: string;
  data: {
    attendees: Attendee[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const eventService = {
  async getEvents(params?: GetEventsParams) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.categoria && params.categoria !== EventCategory.ALL) {
        queryParams.append('categoria', params.categoria);
      }
      if (params?.fechaInicio) {
        queryParams.append('fechaInicio', params.fechaInicio);
      }
      if (params?.fechaFin) {
        queryParams.append('fechaFin', params.fechaFin);
      }
      if (params?.ubicacion && params.ubicacion.trim() !== '') {
        queryParams.append('ubicacion', params.ubicacion.trim());
      }
      if (params?.page && params.page > 0) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit && params.limit > 0) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<EventsResponse>(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async getEventById(id: string) {
    try {
      const response = await api.get<EventResponse>(`/events/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async createEvent(data: CreateEventData) {
    try {
      const isFormData = data instanceof FormData;
      const response = await api.post<EventResponse>('/events', data, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async updateEvent(id: string, data: UpdateEventData) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Si hay una imagen, usar FormData
      if (data.image) {
        const formData = new FormData();
        if (data.nombre) formData.append('nombre', data.nombre);
        if (data.descripcion) formData.append('descripcion', data.descripcion);
        if (data.categoria) formData.append('categoria', data.categoria);
        if (data.fechaInicio) formData.append('fechaInicio', data.fechaInicio);
        if (data.fechaFin !== undefined) {
          formData.append('fechaFin', data.fechaFin || '');
        }
        if (data.ubicacion) formData.append('ubicacion', data.ubicacion);
        if (data.precio !== undefined) {
          formData.append('precio', data.precio.toString());
        }
        
        const imageUri = Platform.OS === 'android' 
          ? data.image.uri 
          : data.image.uri.replace('file://', '');
        
        formData.append('image', {
          uri: imageUri,
          type: data.image.type || 'image/jpeg',
          name: data.image.fileName || `event_${Date.now()}.jpg`,
        } as any);

        const headers: any = {};
        if (token) {
          const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          headers['Authorization'] = authToken;
        }

        const response = await api.put<EventResponse>(`/events/${id}`, formData, {
          headers,
        });
        return response.data;
      } else {
        // Si no hay imagen, enviar como JSON
        const headers: any = {
          'Content-Type': 'application/json',
        };
        if (token) {
          const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
          headers['Authorization'] = authToken;
        }

        const jsonData: any = {};
        if (data.nombre) jsonData.nombre = data.nombre;
        if (data.descripcion) jsonData.descripcion = data.descripcion;
        if (data.categoria) jsonData.categoria = data.categoria;
        if (data.fechaInicio) jsonData.fechaInicio = data.fechaInicio;
        if (data.fechaFin !== undefined) jsonData.fechaFin = data.fechaFin;
        if (data.ubicacion) jsonData.ubicacion = data.ubicacion;
        if (data.precio !== undefined) jsonData.precio = data.precio;

        const response = await api.put<EventResponse>(`/events/${id}`, jsonData, {
          headers,
        });
        return response.data;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async deleteEvent(id: string) {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers: any = {};
      if (token) {
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers['Authorization'] = authToken;
      }

      const response = await api.delete(`/events/${id}`, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async attendEvent(id: string) {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers: any = {};
      if (token) {
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers['Authorization'] = authToken;
      }

      const response = await api.post<{ status: string; message: string }>(`/events/${id}/attend`, {}, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async cancelAttendance(id: string) {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers: any = {};
      if (token) {
        const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
        headers['Authorization'] = authToken;
      }

      const response = await api.delete<{ status: string; message: string }>(`/events/${id}/attend`, {
        headers,
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async getEventAttendees(id: string, page: number = 1, limit: number = 20) {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());

      const response = await api.get<AttendeesResponse>(`/events/${id}/attendees?${queryParams.toString()}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },
};

