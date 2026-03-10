import { create } from 'zustand';
import { Post, PostType, ReactionType, PostReaction } from '../../domain/entities/post.entity';
import { PostRepositoryImpl } from '../../data/repositories/post.repository.impl';

interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  
  fetchPosts: (type?: PostType) => Promise<void>;
  createPost: (data: { title?: string; content: string; type: PostType; imageUrl?: string; authorId: string }) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  reactToPost: (id: string, userId: string, type: ReactionType) => Promise<void>;
  removeReaction: (id: string, userId: string) => Promise<void>;
}

const postRepository = new PostRepositoryImpl();

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  isLoading: false,
  error: null,

  fetchPosts: async (type) => {
    set({ isLoading: true, error: null });
    try {
      const posts = await postRepository.getPosts(type);
      set({ posts, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createPost: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newPost = await postRepository.createPost(data);
      set({ posts: [newPost, ...get().posts], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deletePost: async (id) => {
    try {
      await postRepository.deletePost(id);
      set({ posts: get().posts.filter(p => p.id !== id) });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  reactToPost: async (id, userId, type) => {
    try {
      await postRepository.reactToPost(id, userId, type);
      const posts = get().posts.map(p => {
        if (p.id === id) {
          const reactions = [...p.reactions.filter((r: PostReaction) => r.userId !== userId), { userId, type }];
          return {
            ...p,
            reactions,
            likesCount: reactions.filter((r: PostReaction) => r.type === 'like').length,
            isLikedByMe: type === 'like'
          };
        }
        return p;
      });
      set({ posts });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  removeReaction: async (id, userId) => {
    try {
      await postRepository.removeReaction(id, userId);
      const posts = get().posts.map(p => {
        if (p.id === id) {
          const reactions = p.reactions.filter((r: PostReaction) => r.userId !== userId);
          return {
            ...p,
            reactions,
            likesCount: reactions.filter((r: PostReaction) => r.type === 'like').length,
            isLikedByMe: false
          };
        }
        return p;
      });
      set({ posts });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));
