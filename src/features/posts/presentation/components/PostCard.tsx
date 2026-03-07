import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Post } from '../../domain/entities/post.entity';
import { usePostStore, useAuthStore } from '../../../../store';
import { FONT_WEIGHT } from '../../../../config/globalStyles';
import { colors } from '../../../../config/colors';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  anonimous?: boolean;
}

export const PostCard = ({ post, onPress, anonimous }: PostCardProps) => {
  const { user } = useAuthStore();
  const { reactToPost, removeReaction } = usePostStore();

  const handleLike = async () => {
    if (!user) return;
    try {
      if (post.isLikedByMe) {
        await removeReaction(post.id, user.id);
      } else {
        await reactToPost(post.id, user.id, 'like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Title
        title={anonimous ? 'Anonimo' : post.author.name}
        titleStyle={{ color: '#000000' }}
        subtitle={
          anonimous ? (
            null
          ) : (
            <Text style={{ color: '#000000', marginBottom: 0, marginTop: -8, fontSize: 12 }}>
              {new Date(post.createdAt).toISOString().split('T')[0]}
            </Text>
          )
        }
      />
      <Card.Content>
        {post.title && (
          <Text variant="titleMedium" style={styles.title}>
            {post.title}
          </Text>
        )}
        <Text variant="bodyMedium" style={styles.content}>
          {post.content}
        </Text>
        {post.imageUrl && <Card.Cover source={{ uri: post.imageUrl }} style={styles.cover} />}
      </Card.Content>
      <Card.Actions>
        <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
          <MaterialCommunityIcons
            name={post.isLikedByMe ? 'heart' : 'heart-outline'}
            size={24}
            color={post.isLikedByMe ? '#FF0000' : colors.primary}
          />
          <Text style={styles.actionText}>{post.likesCount}</Text>
        </TouchableOpacity>

        <View style={styles.actionItem}>
          <MaterialCommunityIcons
            name="comment-outline"
            size={24}
            color={colors.primary}
          />
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </View>
      </Card.Actions>
    </Card>
  );
};

import { TouchableOpacity, View } from 'react-native';

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    marginBottom: 4,
    color: '#000000',
    fontWeight: 'bold',
  },
  content: {
    color: '#333',
    marginBottom: 10,
    fontWeight: FONT_WEIGHT.LIGHT as any,
  },
  cover: {
    marginTop: 8,
    borderRadius: 8,
    height: 180,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    gap: 4,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '600',
  }
});
