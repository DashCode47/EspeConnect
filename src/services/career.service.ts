import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum CareerModality {
  PRESENCIAL = 'PRESENCIAL',
  SEMIPRESENCIAL = 'SEMIPRESENCIAL',
  VIRTUAL = 'VIRTUAL'
}

export enum CareerSchedule {
  DIURNO = 'DIURNO',
  NOCTURNO = 'NOCTURNO',
  FIN_DE_SEMANA = 'FIN_DE_SEMANA'
}

export interface Career {
  id: string;
  code: string;
  name: string;
  modality: CareerModality;
  duration: number;
  schedule: CareerSchedule;
  campus: string;
  cesResolution: string;
  directorName: string;
  directorEmail: string;
  accreditations: string[];
  mission: string;
  vision: string;
  objectives: string[];
  graduateProfile: string;
  professionalProfile: string;
  curriculumPdfUrl?: string;
  curriculumDescription: string;
  subjects: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCareerData {
  code: string;
  name: string;
  modality: CareerModality;
  duration: number;
  schedule: CareerSchedule;
  campus: string;
  cesResolution: string;
  directorName: string;
  directorEmail: string;
  accreditations: string[];
  mission: string;
  vision: string;
  objectives: string[];
  graduateProfile: string;
  professionalProfile: string;
  curriculumPdfUrl?: string;
  curriculumDescription: string;
  subjects: string[];
  isActive?: boolean;
}

export interface UpdateCareerData {
  code?: string;
  name?: string;
  modality?: CareerModality;
  duration?: number;
  schedule?: CareerSchedule;
  campus?: string;
  cesResolution?: string;
  directorName?: string;
  directorEmail?: string;
  accreditations?: string[];
  mission?: string;
  vision?: string;
  objectives?: string[];
  graduateProfile?: string;
  professionalProfile?: string;
  curriculumPdfUrl?: string;
  curriculumDescription?: string;
  subjects?: string[];
  isActive?: boolean;
}

export interface CareersResponse {
  status: string;
  data: {
    careers: Career[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    campus?: string;
    modality?: string;
  };
}

export interface CareerResponse {
  status: string;
  data: {
    career: Career;
  };
}

export interface DeleteCareerResponse {
  status: string;
  message: string;
}

export interface GetCareersParams {
  modality?: CareerModality | null;
  campus?: string | null;
  schedule?: CareerSchedule | null;
  isActive?: boolean | null;
  page?: number | null;
  limit?: number | null;
}

const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    return {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
  } catch (error) {
    console.error('Error getting headers:', error);
    throw error;
  }
};

export const careerService = {
  // Get all careers with optional filters
  async getCareers(params?: GetCareersParams) {
    try {
      const queryParams = new URLSearchParams();
      console.log('Params:', params);
      
      if (params?.modality && params.modality.trim() !== '') {
        queryParams.append('modality', params.modality);
      }
      if (params?.campus && params.campus.trim() !== '') {
        queryParams.append('campus', params.campus);
      }
      if (params?.schedule && params.schedule.trim() !== '') {
        queryParams.append('schedule', params.schedule);
      }
      if (params?.isActive !== undefined && params.isActive !== null) {
        queryParams.append('isActive', params.isActive.toString());
      }
      if (params?.page && params.page > 0) {
        queryParams.append('page', params.page.toString());
      }
      if (params?.limit && params.limit > 0) {
        queryParams.append('limit', params.limit.toString());
      }

      const url = `/careers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<CareersResponse>(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Get a single career by ID
  async getCareer(careerId: string) {
    try {
      const response = await api.get<CareerResponse>(`/careers/${careerId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Get a career by code
  async getCareerByCode(code: string) {
    try {
      const response = await api.get<CareerResponse>(`/careers/code/${code}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Get careers by campus
  async getCareersByCampus(campus: string, page?: number, limit?: number) {
    try {
      const queryParams = new URLSearchParams();
      if (page) {
        queryParams.append('page', page.toString());
      }
      if (limit) {
        queryParams.append('limit', limit.toString());
      }

      const url = `/careers/campus/${campus}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<CareersResponse>(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Get careers by modality
  async getCareersByModality(modality: CareerModality, page?: number, limit?: number) {
    try {
      const queryParams = new URLSearchParams();
      if (page) {
        queryParams.append('page', page.toString());
      }
      if (limit) {
        queryParams.append('limit', limit.toString());
      }

      const url = `/careers/modality/${modality}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<CareersResponse>(url);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Create a new career (requires authentication)
  async createCareer(data: CreateCareerData) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.post<CareerResponse>('/careers', data, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Update a career (requires authentication)
  async updateCareer(careerId: string, data: UpdateCareerData) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.put<CareerResponse>(`/careers/${careerId}`, data, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  // Delete a career (requires authentication)
  async deleteCareer(careerId: string) {
    try {
      const headers = await getAuthHeaders();
      const response = await api.delete<DeleteCareerResponse>(`/careers/${careerId}`, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  }
};
