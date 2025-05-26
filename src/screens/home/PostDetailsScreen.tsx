import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Appbar, Card, Text, IconButton, Divider, useTheme, Chip } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { Post, postService } from '../../services/post.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

type PostDetailsScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'PostDetails'>;
type PostDetailsScreenRouteProp = RouteProp<HomeStackParamList, 'PostDetails'>;

const getPostTypeIcon = (type: string) => {
  switch (type) {
    case 'CONFESSION':
      return 'message-text';
    case 'MARKETPLACE':
      return 'store';
    case 'LOST_AND_FOUND':
      return 'magnify';
    default:
      return 'post';
  }
};

const getPostTypeLabel = (type: string) => {
  switch (type) {
    case 'CONFESSION':
      return 'Confesión';
    case 'MARKETPLACE':
      return 'Marketplace';
    case 'LOST_AND_FOUND':
      return 'Perdido y Encontrado';
    default:
      return type;
  }
};

export const PostDetailsScreen = () => {
  const [post, setPost] = useState<Post | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const navigation = useNavigation<PostDetailsScreenNavigationProp>();
  const route = useRoute<PostDetailsScreenRouteProp>();
  const { postData } = route.params;
  const theme = useTheme();

  const handleLike = async () => {
    if (!postData) return;

    try {
      if (isLiked) {
        await postService.unlikePost(postData.id);
        setPost((prev) => prev ? { ...prev, likes: prev.likes - 1 } : null);
      } else {
        await postService.likePost(postData.id);
        setPost((prev) => prev ? { ...prev, likes: prev.likes + 1 } : null);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (!postData) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="alert" size={48} color={theme.colors.error} />
        <Text variant="headlineSmall">Post no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Detalles del Post" />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.card} mode="elevated">
          <Card.Title
            title={postData.author.name}
            subtitle={`@${postData.author.username}`}
            left={(props) => (
              <MaterialCommunityIcons 
                name="account-circle" 
                size={40} 
                color={theme.colors.primary} 
              />
            )}
          />
          
          <Card.Content>
            <Chip 
              icon={getPostTypeIcon(postData.type)}
              style={styles.typeChip}
              mode="outlined"
            >
              {getPostTypeLabel(postData.type)}
            </Chip>

            {postData.title && (
              <Text variant="titleLarge" style={styles.title}>
                {postData.title}
              </Text>
            )}

            <Text variant="bodyLarge" style={styles.contentText}>
              {postData.content}
            </Text>

            {postData.imageUrl && (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: postData.imageUrl }} 
                  style={styles.image}
                  resizeMode="cover"
                />
              </View>
            )}

            <Text variant="bodySmall" style={styles.timestamp}>
              {new Date(postData.createdAt).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </Card.Content>

          <Divider style={styles.divider} />
          
          <Card.Actions>
            <IconButton
              icon={isLiked ? 'heart' : 'heart-outline'}
              onPress={handleLike}
              iconColor={isLiked ? theme.colors.error : theme.colors.onSurface}
            />
            <Text>{postData.likes || 0}</Text>
            <IconButton 
              icon="comment-outline"
              iconColor={theme.colors.onSurface}
            />
            <Text>{postData.comments || 0}</Text>
          </Card.Actions>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  content: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 12,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  title: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  contentText: {
    lineHeight: 24,
    marginBottom: 16,
  },
  imageContainer: {
    marginVertical: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  timestamp: {
    marginTop: 16,
    color: '#666',
  },
  divider: {
    marginVertical: 8,
  },
}); 