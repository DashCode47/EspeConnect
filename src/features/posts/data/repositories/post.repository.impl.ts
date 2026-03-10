import { supabase } from '../../../../lib/supabase';
import { Post, PostType, ReactionType } from '../../domain/entities/post.entity';
import { IPostRepository } from '../../domain/repositories/post.repository';
import { PostMapper } from '../mappers/post.mapper';

export class PostRepositoryImpl implements IPostRepository {
  async getPosts(type?: PostType): Promise<Post[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
      .from('Post')
      .select('*, author:User(*, profiles:Profile(avatar_url)), comments:Comment(id), reactions:Reaction(type, userId)')
      .order('createdAt', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(model => PostMapper.toEntity(model as any, user?.id));
  }

  async getPostById(id: string): Promise<Post | null> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('Post')
      .select('*, author:User(*, profiles:Profile(avatar_url)), comments:Comment(id), reactions:Reaction(type, userId)')
      .eq('id', id)
      .single();

    if (error) return null;

    return PostMapper.toEntity(data as any, user?.id);
  }

  async createPost(data: {
    title?: string;
    content: string;
    type: PostType;
    imageUrl?: string;
    authorId: string;
  }): Promise<Post> {
    const { data: post, error } = await supabase
      .from('Post')
      .insert({
        title: data.title,
        content: data.content,
        type: data.type,
        imageUrl: data.imageUrl,
        authorId: data.authorId,
      })
      .select('*, author:User(*, profiles:Profile(avatar_url)), comments:Comment(id), reactions:Reaction(type, userId)')
      .single();

    if (error) throw error;

    return PostMapper.toEntity(post as any, data.authorId);
  }

  async updatePost(id: string, data: Partial<Post>): Promise<Post> {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data: post, error } = await supabase
      .from('Post')
      .update({
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl,
      })
      .eq('id', id)
      .select('*, author:User(*, profiles:Profile(avatar_url)), comments:Comment(id), reactions:Reaction(type, userId)')
      .single();

    if (error) throw error;

    return PostMapper.toEntity(post as any, user?.id);
  }

  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('Post')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async reactToPost(id: string, userId: string, type: ReactionType): Promise<void> {
    const { error } = await supabase
      .from('Reaction')
      .upsert({
        postId: id,
        userId: userId,
        type: type,
      }, { onConflict: 'postId,userId' });

    if (error) throw error;
  }

  async removeReaction(id: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('Reaction')
      .delete()
      .eq('postId', id)
      .eq('userId', userId);

    if (error) throw error;
  }
}
