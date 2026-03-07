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
// import LinearGradient from 'react-native-linear-gradient';
import { Appbar, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PostStackParamList } from '../../../../navigation/types';
import { PostType } from '../../domain/entities/post.entity';
import { PostCard } from '../components/PostCard';
import { MarketplaceCard } from '../../../marketplace/presentation/components/MarketplaceCard';
import { ProductCategory } from '../../../marketplace/domain/entities/product.entity';
import { usePostStore, useMarketplaceStore, useAuthStore } from '../../../../store';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles } from '../../../../config/globalStyles';
import { colors } from '../../../../config/colors';

type PostScreenNavigationProp = NativeStackNavigationProp<PostStackParamList, 'Feed'>;

// Category mapping for filtering
const categoryMapping: { [key: string]: ProductCategory | undefined } = {
  'Todo': undefined,
  'Libros': 'BOOKS',
  'Uniformes': 'UNIFORMS',
  'Tecnología': 'TECHNOLOGY',
  'Hogar': 'HOME',
  'Otros': 'OTHER',
};

export const PostScreen = () => {
  const insets = useSafeAreaInsets();
  const [selectedType, setSelectedType] = useState<PostType>('MARKETPLACE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todo');
  const navigation = useNavigation<PostScreenNavigationProp>();

  const { user } = useAuthStore();
  const { posts, isLoading: postsLoading, fetchPosts } = usePostStore();
  const { products, isLoading: productsLoading, fetchProducts } = useMarketplaceStore();

  const loading = postsLoading || productsLoading;

  useEffect(() => {
    if (user) {
      if (selectedType === 'MARKETPLACE') {
        fetchProducts({
          category: categoryMapping[selectedCategory],
          search: searchQuery || undefined,
        });
      } else {
        fetchPosts(selectedType);
      }
    }
  }, [selectedType, user, selectedCategory]);

  // Debounced search
  useEffect(() => {
    if (selectedType === 'MARKETPLACE' && user) {
      const timer = setTimeout(() => {
        fetchProducts({
          category: categoryMapping[selectedCategory],
          search: searchQuery || undefined,
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [searchQuery]);

  const handleRefresh = () => {
    if (selectedType === 'MARKETPLACE') {
      fetchProducts({
        category: categoryMapping[selectedCategory],
        search: searchQuery || undefined,
      });
    } else {
      fetchPosts(selectedType);
    }
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const renderPostItem = ({ item }: { item: any }) => {
    return (
      <PostCard
        post={item}
        onPress={() => navigation.navigate('PostDetails', { postData: item })}
      />
    );
  };

  const renderMarketplaceGrid = () => {
    if (loading && products.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (products.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="package-variant" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No hay productos disponibles</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MarketplaceCard
            product={item}
            onPress={() => navigation.navigate('PostDetails', { productData: item })}
          />
        )}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.gridRow}
        style={styles.flatListStyle}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
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

  const categories = [
    { label: 'Todo', icon: 'view-grid' },
    { label: 'Libros', icon: 'book-open-variant' },
    { label: 'Tecnología', icon: 'laptop' },
    { label: 'Uniformes', icon: 'tshirt-crew' },
    { label: 'Hogar', icon: 'sofa' },
    { label: 'Otros', icon: 'dots-horizontal' },
  ];

  if (selectedType === 'MARKETPLACE') {
    return (
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.marketplaceHeader}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="chevron-left" size={24} color={colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Marketplace</Text>
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.notificationButton}>
                <MaterialCommunityIcons name="bell" size={20} color={colors.white} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.bookmarkButton}>
                <MaterialCommunityIcons name="bookmark" size={20} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#B6B6B6"
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar productos..."
                placeholderTextColor="#B6B6B6"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryChipsScrollView}
          contentContainerStyle={styles.categoryChipsContainer}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <TouchableOpacity
                key={cat.label}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategory(cat.label)}
                activeOpacity={0.8}>
                <MaterialCommunityIcons
                  name={cat.icon}
                  size={20}
                  color={isActive ? '#fff' : colors.primaryDark}
                />
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive && styles.categoryChipTextActive,
                  ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        {/* Grid Content */}
        {renderMarketplaceGrid()}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[styles.fab, { bottom: insets.bottom + 74 }]}
          onPress={handleCreatePost}
          activeOpacity={0.8}>
          <MaterialCommunityIcons name="plus" size={32} color={colors.white} />
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Posts" titleStyle={{ color: '#000000' }} />
        <Appbar.Action icon="plus" onPress={handleCreatePost} iconColor="#FFFFFF" />
      </Appbar.Header>

      {renderPostTypeChips()}

      {loading && posts.length === 0 ? (
        <ActivityIndicator size="large" style={styles.loader} color={colors.primary} />
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPostItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={loading}
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
    paddingTop: globalStyles.screenHeight * 0.01,
  },
  header: {
    backgroundColor: '#0000',
    elevation: 2,
  },
  marketplaceHeader: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.accent,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#131413',
    paddingVertical: 0,
  },
  categoryChipsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 10,
    alignItems: 'center',
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: colors.primaryDark,
    backgroundColor: '#fff',
    shadowColor: colors.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  categoryChipActive: {
    backgroundColor: colors.primaryDark,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  categoryChipTextActive: {
    color: '#fff',
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
  categoryChipsScrollView: {
    flexGrow: 0,
    flexShrink: 0,
  },
  flatListStyle: {
    flex: 1,
  },
  gridContainer: {
    paddingBottom: 100,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 16,
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
