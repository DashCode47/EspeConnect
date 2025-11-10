import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {Card, Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Post, postService} from '../services/post.service';
import { FONT_WEIGHT } from '../config/globalStyles';
import { colors } from '../config/colors';

interface PostCardProps {
  post: Post;
  onPress: () => void;
  anonimous?: boolean;
}

export const PostCard = ({post, onPress, anonimous}: PostCardProps) => {
  console.log(post);
  const [likes, setLikes] = useState(post.reactions?.length);
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
        titleStyle={{color: '#000000'}}
        subtitle={
          anonimous ? (
            null
          ) : (
            <Text style={{color: '#000000', marginBottom: 0, marginTop: -8, fontSize: 12}}>
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
          color={isLiked ? '#FF0000' : '#008000'}
          onPress={handleLike}
        />
        <Text style={{color: '#008000', fontWeight: '600'}}>{likes}</Text>
        <MaterialCommunityIcons
          name="comment-outline"
          size={24}
          color="#008000"
        />
        <Text style={{color: '#008000', fontWeight: '600'}}>{post.comments}</Text>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#000000',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  title: {
    marginBottom: 0,
    color: '#000000',
    fontWeight: 'bold',
  },
  content: {
    color: '#000000',
    marginBottom: 10,
    fontWeight: FONT_WEIGHT.LIGHT,
  },
});
