import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Card, Text, Avatar, Button, useTheme } from 'react-native-paper';
import { Comment } from '../services/comment.service';

interface CommentListProps {
  comments: Comment[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const CommentList = ({ comments, loading, hasMore, onLoadMore }: CommentListProps) => {
  const theme = useTheme();

  if (loading && comments.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>
        Comentarios ({comments.length})
      </Text>

      {comments.map((comment) => (
        <Card key={comment.id} style={styles.commentCard} mode="outlined">
          <Card.Title
            title={comment.author.name}
            subtitle={new Date(comment.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
            left={(props) => (
              <Avatar.Image
                size={40}
                source={
                  { uri: comment.author.avatarUrl || undefined }
                }
              />
            )}
          />
          <Card.Content>
            <Text variant="bodyMedium">{comment.content}</Text>
          </Card.Content>
        </Card>
      ))}

      {loading && (
        <View style={styles.loadingMore}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
        </View>
      )}

      {!loading && hasMore && (
        <Button
          mode="text"
          onPress={onLoadMore}
          style={styles.loadMoreButton}
        >
          Cargar más comentarios
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  commentCard: {
    marginBottom: 12,
  },
  loadingMore: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    marginTop: 8,
  },
}); 