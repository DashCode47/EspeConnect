import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosRequestConfig } from 'axios';

export interface Post {
  id: string;
  title?: string;
  content: string;
  authorId: string;
  imageUrl?: string;
  type: 'CONFESSION' | 'MARKETPLACE' | 'LOST_AND_FOUND';
  author: {
    id: string;
    name: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
}

interface PostsResponse {
  data: {
    posts: Post[];
  };
}

export interface CreatePostData {
  title: string;
  content: string;
  type: 'CONFESSION' | 'MARKETPLACE' | 'LOST_AND_FOUND';
  imageUrl?: string;
}

export interface UpdatePostData {
  title?: string;
  content?: string;
}

interface RequestHeaders {
  headers: Record<string, string>;
}

const logCurl = (config: AxiosRequestConfig) => {
  const { method, url, headers, data } = config;
  let curlCommand = `curl -X ${method?.toUpperCase()} '${url}'`;

  // Add headers
  Object.entries(headers || {}).forEach(([key, value]) => {
    curlCommand += ` -H '${key}: ${value}'`;
  });

  // Add data for POST/PUT requests
  if (data) {
    curlCommand += ` -d '${JSON.stringify(data)}'`;
  }

  console.log('cURL command:', curlCommand);
};

const getAuthHeaders = async (): Promise<RequestHeaders> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const headersResponse: RequestHeaders = {
      headers: {
        'Content-Type': 'application/json'
      }
    };

    return headersResponse;
  } catch (error) {
    console.error('Error getting headers:', error);
    throw error;
  }
};

export const postService = {
  async getPosts(type = 'CONFESSION') {
    try {
      const headers = await getAuthHeaders();
      const requestConfig: AxiosRequestConfig = {
        method: 'GET',
        url: `${api.defaults.baseURL}/posts?type=${type}`,
        headers: headers.headers
      };

      // Log the curl command before making the request
      logCurl(requestConfig);

      const response = await api.get<PostsResponse>(`/posts?type=${type}`, headers);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        await AsyncStorage.removeItem('token');
      }
      throw error;
    }
  },

  async getPostById(id: string) {
    try {
      const response = await api.get<Post>(`/posts/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createPost(data: CreatePostData) {
    try {
      const response = await api.post<Post>('/posts', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updatePost(id: string, data: UpdatePostData) {
    try {
      const response = await api.put<Post>(`/posts/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deletePost(id: string) {
    try {
      await api.delete(`/posts/${id}`);
    } catch (error) {
      throw error;
    }
  },

  async likePost(id: string) {
    try {
      const response = await api.post<Post>(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async unlikePost(id: string) {
    try {
      const response = await api.delete<Post>(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 