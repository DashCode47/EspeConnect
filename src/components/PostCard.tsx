import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Post, postService} from '../services/post.service';
import { FONT_WEIGHT } from '../config/globalStyles';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  anonimous?: boolean;
}

export const PostCard = ({post, onPress, anonimous}: PostCardProps) => {
  const [likes, setLikes] = useState(post.likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = async () => {
    try {
      if (isLiked) {
        await postService.unlikePost(post.id);
        setLikes(prev => prev - 1);
      } else {
        await postService.likePost(post.id);
        setLikes(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Title
        title={anonimous ? 'Anonimo' : post.author.name}
        subtitle={
          anonimous ? (
            null
          ) : (
            <Text style={{color: 'gray', marginBottom: 0, marginTop: -8, fontSize: 12}}>
              {new Date(post.createdAt).toISOString().split('T')[0]}
            </Text>
          )
        }
      />
      <Card.Content>
        <Text variant="titleMedium" style={styles.title}>
          {post.title}
        </Text>
        <Text variant="bodyMedium" style={styles.content}>
          {post.content}
        </Text>
        {post.imageUrl && <Card.Cover source={{uri: post.imageUrl}} />}
      </Card.Content>
      <Card.Actions>
        <MaterialCommunityIcons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={24}
          color={isLiked ? '#6200ee' : '#757575'}
          onPress={handleLike}
        />
        <Text>{likes}</Text>
        <MaterialCommunityIcons
          name="comment-outline"
          size={24}
          color="#757575"
        />
        <Text>{post.comments}</Text>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 0,
  },
  content: {
    color: 'black',
    marginBottom: 10,
    fontWeight: FONT_WEIGHT.BOLD,
  },
});
