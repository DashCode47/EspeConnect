export type PostType = 'CONFESSION' | 'MARKETPLACE' | 'LOST_AND_FOUND';
export type ReactionType = 'like' | 'dislike';

export interface PostAuthor {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

export interface PostReaction {
  userId: string;
  type: ReactionType;
}

export interface Post {
  id: string;
  title?: string;
  content: string;
  authorId: string;
  imageUrl?: string;
  type: PostType;
  author: PostAuthor;
  createdAt: string;
  updatedAt: string;
  commentsCount: number;
  reactions: PostReaction[];
  likesCount: number;
  isLikedByMe: boolean;
}
