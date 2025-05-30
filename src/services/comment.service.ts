import api from './api';
import { User } from './match.service';

export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

interface CommentResponse {
  status: string;
  data: {
    comment: Comment;
  };
}

interface CommentsResponse {
  status: string;
  data: {
    comments: Comment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export const commentService = {
  async createComment(postId: string, content: string) {
    const response = await api.post<CommentResponse>(`/posts/${postId}/comments`, { content });
    return response.data;
  },

  async getComments(postId: string, page = 1, limit = 10) {
    const response = await api.get<CommentsResponse>(
      `/posts/${postId}/comments?page=${page}&limit=${limit}`
    );
    return response.data;
  }
}; 