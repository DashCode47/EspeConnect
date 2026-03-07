import { Post, PostAuthor, PostReaction } from '../../domain/entities/post.entity';
import { PostModel } from '../models/post.model';

export class PostMapper {
  static toEntity(model: PostModel, currentUserId?: string): Post {
    const reactions = (model.reactions || []).map(r => ({
      userId: r.userId,
      type: r.type as 'like' | 'dislike'
    }));

    const likesCount = reactions.filter(r => r.type === 'like').length;
    const isLikedByMe = currentUserId ? reactions.some(r => r.userId === currentUserId && r.type === 'like') : false;

    return {
      id: model.id,
      title: model.title,
      content: model.content,
      authorId: model.authorId,
      imageUrl: model.imageUrl,
      type: model.type,
      author: {
        id: model.author.id,
        name: model.author.name,
        username: model.author.username,
        avatarUrl: model.author.profiles?.avatar_url
      },
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      commentsCount: model.comments?.length || 0,
      reactions: reactions,
      likesCount: likesCount,
      isLikedByMe: isLikedByMe
    };
  }
}
