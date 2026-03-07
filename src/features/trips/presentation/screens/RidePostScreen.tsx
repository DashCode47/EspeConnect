import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RidePostHeader } from '../../../../components/rides/RidePostHeader';
import { RidePostCard } from '../../../../components/rides/RidePostCard';
import { CommentInput } from '../../../../components/rides/CommentInput';
import { Post, postService } from '../../../../services/post.service';
import { Comment, commentService } from '../../../../services/comment.service';
import { useAuthStore } from '../../../../features/auth/presentation/store/auth.store';
import { colors } from '../../../../config/colors';

type RidePostScreenRouteProp = RouteProp<any, 'RidePost'>;

export const RidePostScreen = () => {
  const route = useRoute<RidePostScreenRouteProp>();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user: profile } = useAuthStore();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Get post ID from route params or use a default for now
  const postId = (route.params as any)?.postId || '';

  useEffect(() => {
    fetchPost();
  }, []);

  useEffect(() => {
    if (post) {
      fetchComments();
      checkIfLiked();
    }
  }, [post]);

  const fetchPost = async () => {
    if (!postId) {
      // If no postId provided, we'll use mock data for now
      // In a real scenario, you'd navigate back or show an error
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await postService.getPostById(postId);
      setPost(response as any);
      setLikesCount((response as any).reactions?.length || 0);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (pageToLoad = 1) => {
    if (!post) return;

    try {
      setLoading(true);
      const response = await commentService.getComments(post.id, pageToLoad);

      if (pageToLoad === 1) {
        setComments(response.data.comments);
      } else {
        setComments(prev => [...prev, ...response.data.comments]);
      }

      setHasMore(pageToLoad < response.data.pagination.pages);
      setPage(pageToLoad);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfLiked = () => {
    if (!post || !profile) return;

    const hasLiked = post.reactions?.some(
      reaction => reaction.userId === profile.id && reaction.type === 'like'
    );
    setIsLiked(hasLiked || false);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchComments(page + 1);
    }
  };

  const handleSubmitComment = async () => {
    if (!post || !newComment.trim() || submitting) return;

    try {
      setSubmitting(true);
      const response = await commentService.createComment(post.id, newComment.trim());
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;

    try {
      if (isLiked) {
        await postService.unlikePost(post.id);
        setLikesCount(prev => prev - 1);
      } else {
        await postService.likePost(post.id);
        setLikesCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleShare = () => {
    // Implement share functionality
    console.log('Share post');
  };

  // Mock data for demonstration if no post is provided
  const mockPost: Post = {
    id: '1',
    content: '¡Atención a todos los estudiantes de Software! Les comparto los apuntes de la clase de hoy de Cálculo. Espero que les sirva para estudiar para el examen del viernes. ¡Mucho éxito a todos!',
    authorId: '1',
    type: 'CONFESSION',
    author: {
      id: '1',
      name: 'Andrés Pérez',
      username: 'andresperez',
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updatedAt: new Date().toISOString(),
    comments: 3,
    reactions: [],
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbPohRaE8dNqhX9Bh2x-yLm2jQtN5alf6PbR4_JgCN6IEnY7aw9SUK29TO4PT_1E9WORj_ilJ5pOChDrrzVWLf1azr5MF6y6w381nRi3TbLhPB_jw4ry-3i2ok1Ah6oiw1k5BtY6ga0w7hXpkjG3THJGgQ-w5eYQK1deCACqzkrqtYRugXeTvL1rBELHo4V5Veaqiwy7QtQs9W7tqtEEBtc90O-oVacIrtuyEmroYZ4WrjMacPwJIyHH-OsBZJG1FYzIx36ytMMg',
  };

  const displayPost = post || mockPost;
  const displayLikes = post ? likesCount : 12;

  if (!displayPost) {
    return (
      <SafeAreaView style={styles.container}>
        <RidePostHeader />
        <View style={styles.errorContainer}>
          <Text>Post no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <RidePostHeader />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <RidePostCard
          author={{
            name: displayPost.author.name,
            avatarUrl: null, // You can add avatarUrl to Post interface if needed
          }}
          createdAt={displayPost.createdAt}
          content={displayPost.content}
          imageUrl={displayPost.imageUrl}
          likes={displayLikes}
          comments={displayPost.comments || 0}
          isLiked={isLiked}
          onLikePress={handleLike}
          onCommentPress={() => { }}
          onSharePress={handleShare}
        />

        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comentarios</Text>
          {/* <CommentList
            comments={comments}
            loading={loading}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
          /> */}
        </View>
      </ScrollView>

      <CommentInput
        value={newComment}
        onChangeText={setNewComment}
        onSubmit={handleSubmitComment}
        userAvatar={profile?.avatarUrl || null}
        userName={profile?.name || ''}
        disabled={submitting}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  commentsSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

