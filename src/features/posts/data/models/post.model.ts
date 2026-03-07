export interface PostModel {
  id: string;
  title?: string;
  content: string;
  authorId: string;
  imageUrl?: string;
  type: 'CONFESSION' | 'MARKETPLACE' | 'LOST_AND_FOUND';
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string;
    username: string;
    profiles?: {
      avatar_url: string;
    }
  };
  comments: { id: string }[];
  reactions: {
    type: 'like' | 'dislike';
    userId: string;
  }[];
}
