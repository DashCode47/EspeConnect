import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PostStackParamList } from '../../../../navigation/types';
import { PostType } from '../../domain/entities/post.entity';
import { MarketplaceCard } from '../../../marketplace/presentation/components/MarketplaceCard';
import { ProductCategory } from '../../../marketplace/domain/entities/product.entity';
import { usePostStore, useMarketplaceStore, useAuthStore } from '../../../../store';
import { PostsSkeletonLoader } from '../components/PostsSkeletonLoader';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../../config/colors';

type PostScreenNavigationProp = NativeStackNavigationProp<PostStackParamList, 'Feed'>;

// Category mapping for filtering
const categoryMapping: { [key: string]: ProductCategory | undefined } = {
  'Todo': undefined,
  'Tecnología': 'TECNOLOGIA',
  'Comida': 'COMIDA',
  'Libros': 'LIBROS',
  'Servicios': 'SERVICIOS',
  'Otros': 'OTROS',
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
  console.log('=', products)
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

  const renderMarketplaceGrid = () => {
    if (loading && products.length === 0) {
      return <PostsSkeletonLoader />;
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

  const categories = [
    { label: 'Todo', icon: 'view-grid' },
    { label: 'Tecnología', icon: 'laptop' },
    { label: 'Comida', icon: 'food-apple' },
    { label: 'Libros', icon: 'book-open-variant' },
    { label: 'Servicios', icon: 'hammer-wrench' },
    { label: 'Otros', icon: 'dots-horizontal' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8f7" />

      {/* Standardized Header */}
      <View style={[styles.standardHeader, { paddingTop: insets.top }]}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>CAMPLUS</Text>
          <Text style={styles.headerTitle}>
            {selectedType === 'MARKETPLACE' ? 'Marketplace' : 'Posts'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAddButton}
          onPress={handleCreatePost}
        >
          <MaterialCommunityIcons name="plus" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
      </View>

      {selectedType === 'MARKETPLACE' && (
        <View style={styles.marketplaceSearchSection}>
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
      )}

      {selectedType === 'MARKETPLACE' && (
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
                  color={isActive ? colors.white : colors.primary}
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
      )}

      {renderMarketplaceGrid()}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f7',
  },
  standardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(246, 248, 247, 0.8)',
    justifyContent: 'flex-end',
  },
  headerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerSubtitle: {
    fontSize: 10,
    fontFamily: 'LeagueSpartan-Black',
    color: `${colors.primary}99`,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'LeagueSpartan-Bold',
    color: colors.primaryDark,
  },
  headerAddButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  marketplaceSearchSection: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
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
    borderColor: colors.primary,
    backgroundColor: colors.white,
    elevation: 2,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
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
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    color: colors.black,
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
