import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { colors } from '../../config/colors';
import { ReactionBar } from './ReactionBar';

interface Author {
  name: string;
  avatarUrl?: string | null;
}

interface RidePostCardProps {
  author: Author;
  createdAt: string;
  content: string;
  imageUrl?: string | null;
  likes?: number;
  comments?: number;
  isLiked?: boolean;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
}

export const RidePostCard = ({ 
  author, 
  createdAt, 
  content, 
  imageUrl,
  likes = 0,
  comments = 0,
  isLiked = false,
  onLikePress,
  onCommentPress,
  onSharePress,
}: RidePostCardProps) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `hace ${diffInMinutes} minutos`;
    } else if (diffInHours === 1) {
      return 'hace 1 hora';
    } else {
      return `hace ${diffInHours} horas`;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {author.avatarUrl ? (
          <Avatar.Image
            size={48}
            source={{ uri: author.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <Avatar.Text
            size={48}
            label={author.name.charAt(0).toUpperCase()}
            style={styles.avatar}
          />
        )}
        <View style={styles.authorInfo}>
          <Text style={styles.authorName}>{author.name}</Text>
          <Text style={styles.timeAgo}>{formatTimeAgo(createdAt)}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.contentText}>{content}</Text>
        
        {imageUrl && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          </View>
        )}
      </View>

      <ReactionBar
        likes={likes}
        comments={comments}
        isLiked={isLiked}
        onLikePress={onLikePress}
        onCommentPress={onCommentPress}
        onSharePress={onSharePress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  timeAgo: {
    fontSize: 14,
    color: '#888888',
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentText: {
    fontSize: 15,
    color: colors.black,
    lineHeight: 22,
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F0F0',
  },
});

