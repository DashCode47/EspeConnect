import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Appbar, Chip, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HomeStackParamList } from '../../navigation/types';
import { Post, postService } from '../../services/post.service';
import { PostCard } from '../../components/PostCard';
import { MarketplaceCard } from '../../components/MarketplaceCard';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../../config/globalStyles';
import { colors } from '../../config/colors';

type PostScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Feed'>;

type PostType = 'CONFESSION' | 'MARKETPLACE' | 'LOST_AND_FOUND';

export const PostScreen = () => {
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedType, setSelectedType] = useState<PostType>('MARKETPLACE');
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation<PostScreenNavigationProp>();
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

  const renderItem = ({ item }: { item: Post }) => {
    if (selectedType === 'MARKETPLACE') {
      return (
        <MarketplaceCard
          post={item}
          onPress={() => navigation.navigate('PostDetails', { postData: item })}
        />
      );
    }
    return (
      <PostCard
        post={item}
        onPress={() => navigation.navigate('PostDetails', { postData: item })}
      />
    );
  };

  const renderMarketplaceGrid = () => {
    const filteredPosts = searchQuery
      ? posts.filter(
          (post) =>
            (post.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              post.content.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      : posts;

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.gridContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {filteredPosts.map((item, index) => (
          <View key={item.id} style={styles.gridItem}>
            {renderItem({ item })}
          </View>
        ))}
      </ScrollView>
    );
  };

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

  if (selectedType === 'MARKETPLACE') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.marketplaceHeader}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Marketplace</Text>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={colors.black} />
            </TouchableOpacity>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#666"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar en Marketplace..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <MaterialCommunityIcons name="tune" size={20} color={colors.black} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Chips for filtering
        {renderPostTypeChips()} */}

        {/* Grid Content */}
        {renderMarketplaceGrid()}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 74 }]}
          onPress={handleCreatePost}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="plus" size={32} color={colors.white} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Posts" titleStyle={{color: '#000000'}} />
        <Appbar.Action icon="plus" onPress={handleCreatePost} iconColor="#FFFFFF" />
      </Appbar.Header>
      
      {renderPostTypeChips()}
      
      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={{
            paddingBottom: globalStyles.getBottomSafeArea(insets) + 20,
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: globalStyles.screenHeight * 0.06,
  },
  header: {
    backgroundColor: '#0000',
    elevation: 2,
  },
  marketplaceHeader: {
    backgroundColor: colors.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 999,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.black,
    paddingVertical: 0,
  },
  filterButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: colors.white,
  },
  chipContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#F0F8F0',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
    paddingBottom: 100,
  },
  gridItem: {
    width: '50%',
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  loader: {
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
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
    color: colors.primary,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
}); 