import { PostType, ReactionType } from '../entities/post.entity';
import { Post } from '../entities/post.entity';

export interface IPostRepository {
  getPosts(type?: PostType): Promise<Post[]>;
  getPostById(id: string): Promise<Post | null>;
  createPost(data: {
    title?: string;
    content: string;
    type: PostType;
    imageUrl?: string;
    authorId: string;
  }): Promise<Post>;
  updatePost(id: string, data: Partial<Post>): Promise<Post>;
  deletePost(id: string): Promise<void>;
  reactToPost(id: string, userId: string, type: ReactionType): Promise<void>;
  removeReaction(id: string, userId: string): Promise<void>;
}
