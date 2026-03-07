import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';

interface ReactionBarProps {
  likes: number;
  comments: number;
  isLiked?: boolean;
  onLikePress?: () => void;
  onCommentPress?: () => void;
  onSharePress?: () => void;
}

export const ReactionBar = ({
  likes,
  comments,
  isLiked = false,
  onLikePress,
  onCommentPress,
  onSharePress,
}: ReactionBarProps) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.reactionButton}
        onPress={onLikePress}
      >
        <MaterialCommunityIcons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={20}
          color={isLiked ? '#FF0000' : '#888888'}
        />
        <Text style={[styles.reactionText, isLiked && styles.likedText]}>
          {likes}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reactionButton}
        onPress={onCommentPress}
      >
        <MaterialCommunityIcons
          name="comment-outline"
          size={20}
          color="#888888"
        />
        <Text style={styles.reactionText}>{comments}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.reactionButton}
        onPress={onSharePress}
      >
        <MaterialCommunityIcons
          name="share-outline"
          size={20}
          color="#888888"
        />
        <Text style={styles.reactionText}>Compartir</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    gap: 4,
  },
  reactionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: 8,
  },
  reactionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888888',
  },
  likedText: {
    color: '#FF0000',
  },
});

