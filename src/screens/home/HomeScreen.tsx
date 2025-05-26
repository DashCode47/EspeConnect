import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
} from 'react-native';
import { Appbar, Chip, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeStackParamList } from '../../navigation/types';
import { Post, postService } from '../../services/post.service';
import { PostCard } from '../../components/PostCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Feed'>;

type PostType = 'CONFESSION' | 'MARKETPLACE' | 'LOST_AND_FOUND';

export const HomeScreen = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<PostType>('CONFESSION');
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Verify token on component mount
    const verifyToken = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('Current token:', token);
        if (!token) {
          console.warn('No token found in storage');
        }
      } catch (error) {
        console.error('Error checking token:', error);
      }
    };
    verifyToken();
  }, []);

  const fetchPosts = async (type: PostType, shouldRefresh = false) => {
    try {
      setLoading(true);
      const response = await postService.getPosts(type);
      setPosts(response.data.posts);
    } catch (error: any) {
      console.error('Error fetching posts:', error);
      // Check if the error is due to authentication
      if (error.response?.status === 401) {
        console.error('Authentication error fetching posts');
        // You might want to handle the unauthorized error here
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPosts(selectedType);
    }
  }, [selectedType, isAuthenticated]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts(selectedType, true);
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const renderItem = ({ item }: { item: Post }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetails', { postData: item })}
    />
  );

  const renderPostTypeChips = () => (
    <View style={styles.chipContainer}>
      <Chip
        selected={selectedType === 'CONFESSION'}
        onPress={() => setSelectedType('CONFESSION')}
        style={styles.chip}
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="message-text" size={size} color={color} />
        )}
      >
        Confessions
      </Chip>
      <Chip
        selected={selectedType === 'MARKETPLACE'}
        onPress={() => setSelectedType('MARKETPLACE')}
        style={styles.chip}
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="account-group" size={size} color={color} />
        )}
      >
        Social
      </Chip>
      <Chip
        selected={selectedType === 'LOST_AND_FOUND'}
        onPress={() => setSelectedType('LOST_AND_FOUND')}
        style={styles.chip}
        icon={({ size, color }) => (
          <MaterialCommunityIcons name="school" size={size} color={color} />
        )}
      >
        Academic
      </Chip>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="ESPE Connect" />
        <Appbar.Action icon="plus" onPress={handleCreatePost} />
      </Appbar.Header>

      {renderPostTypeChips()}

      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} size="large" />
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="post-outline"
                size={64}
                color={theme.colors.primary}
              />
              <Text style={styles.emptyText}>No posts yet</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chipContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    justifyContent: 'space-around',
  },
  chip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Add extra padding at the bottom
  },
  loader: {
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
}); 