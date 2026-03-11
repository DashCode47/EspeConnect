import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PostStackParamList } from '../../../../navigation/types';
import { Post } from '../../domain/entities/post.entity';
import { Product } from '../../../marketplace/domain/entities/product.entity';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../../config/colors';
import { useHideNavbar } from '../../../../hooks/useHideNavbar';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

type PostDetailsScreenNavigationProp = NativeStackNavigationProp<PostStackParamList, 'PostDetails'>;
type PostDetailsScreenRouteProp = RouteProp<PostStackParamList, 'PostDetails'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Helper to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Helper to get category label
const getCategoryLabel = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    'TECNOLOGIA': 'Tecnología',
    'COMIDA': 'Comida',
    'LIBROS': 'Libros',
    'SERVICIOS': 'Servicios',
    'OTROS': 'Otros',
  };
  return categoryMap[category] || category;
};

export const PostDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PostDetailsScreenNavigationProp>();
  const route = useRoute<PostDetailsScreenRouteProp>();
  const { postData, productData } = route.params;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const carouselRef = useRef<ICarouselInstance>(null);

  useHideNavbar(true);

  // Determine if we're showing a Product or a Post
  const isProduct = !!productData;
  const data = productData || postData;

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert" size={48} color={colors.primary} />
          <Text style={styles.errorText}>Producto no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Get display data based on type
  const getDisplayData = () => {
    if (isProduct && productData) {
      return {
        title: productData.title,
        price: formatPrice(productData.price),
        category: getCategoryLabel(productData.category),
        description: productData.description,
        imageUrl: productData.imageUrl,
        imageUrls: productData.imageUrls?.length ? productData.imageUrls : (productData.imageUrl ? [productData.imageUrl] : []),
        contact: productData.contact,
        createdAt: productData.createdAt,
      };
    } else if (postData) {
      // Parse old Post format
      const content = postData.content || '';
      const lines = content.split('\n');

      let price = '';
      let category = 'General';
      let description = '';

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('Precio:')) {
          const priceMatch = trimmedLine.match(/Precio:\s*(.+)/);
          if (priceMatch) price = priceMatch[1].trim();
        } else if (trimmedLine.startsWith('Categoría:')) {
          const match = trimmedLine.match(/Categoría:\s*(.+)/);
          if (match) category = match[1].trim();
        } else if (trimmedLine && !trimmedLine.startsWith('Precio:') && !trimmedLine.startsWith('Categoría:') && !trimmedLine.startsWith('Contacto:')) {
          description += (description ? ' ' : '') + trimmedLine;
        }
      });

      if (!description.trim()) {
        description = content;
      }

      return {
        title: postData.title || 'Producto',
        price,
        category,
        description,
        imageUrl: postData.imageUrl,
        imageUrls: postData.imageUrl ? [postData.imageUrl] : [],
        contact: null,
        createdAt: postData.createdAt,
      };
    }
    return null;
  };

  const displayData = getDisplayData();
  if (!displayData) return null;

  const images = displayData.imageUrls ?? [];

  const handleSnapToItem = (index: number) => {
    setActiveIndex(index);
  };

  const handleContact = () => {
    if (displayData.contact) {
      // If contact is a phone number, open dialer
      const phoneRegex = /^\+?[\d\s-]+$/;
      if (phoneRegex.test(displayData.contact.replace(/\s/g, ''))) {
        Linking.openURL(`tel:${displayData.contact}`);
      } else {
        // Show contact info in alert
        Alert.alert('Contacto', displayData.contact);
      }
    } else {
      Alert.alert('Contactar', 'Información de contacto no disponible');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>

        {/* Image Section */}
        <View style={styles.imageSection}>
          {images.length > 0 ? (
              <Carousel
                ref={carouselRef}
                loop={false}
                width={SCREEN_WIDTH}
                height={400}
                data={images}
                renderItem={({ item }) => (
                  <View style={styles.imageItemContainer}>
                    <Image source={{ uri: item }} style={styles.productImage} resizeMode="contain" />
                  </View>
                )}
                onSnapToItem={handleSnapToItem}
                enabled={images.length > 1}
                defaultIndex={0}
              />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="image-off" size={64} color="#999" />
            </View>
          )}
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeIndex && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.contentSection}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{displayData.category}</Text>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.productTitle}>{displayData.title}</Text>
          </View>

          {/* Price */}
          {displayData.price && (
            <View style={styles.priceSection}>
              <Text style={styles.priceText}>{displayData.price}</Text>
            </View>
          )}

          {/* Published Date */}
          {displayData.createdAt && (
            <View style={styles.dateSection}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.dateText}>Publicado el {formatDate(displayData.createdAt)}</Text>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.descriptionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>{displayData.description}</Text>
          </View>

          {/* Contact Info */}
          {displayData.contact && (
            <>
              <View style={styles.divider} />
              <View style={styles.contactInfoSection}>
                <Text style={styles.contactInfoTitle}>Información de contacto</Text>
                <View style={styles.contactInfoRow}>
                  <MaterialCommunityIcons name="phone" size={20} color={colors.primary} />
                  <Text style={styles.contactInfoText}>{displayData.contact}</Text>
                </View>
              </View>
            </>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Seller Info */}
          <View style={styles.sellerSection}>
            <Text style={styles.sellerSectionTitle}>Información del vendedor</Text>
            <View style={styles.sellerCard}>
              <View style={styles.sellerLeft}>
                <View style={styles.sellerAvatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={24} color="#666" />
                </View>
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>Vendedor</Text>
                  <Text style={styles.sellerCareer}>Estudiante</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer with Contact Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={handleContact}>
          <MaterialCommunityIcons name="message-text" size={20} color={colors.white} style={{ marginRight: 8 }} />
          <Text style={styles.contactButtonText}>Contactar vendedor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  imageSection: {
    position: 'relative',
    height: 400,
    width: '100%',
    backgroundColor: '#F8F9FA',
  },
  imageItemContainer: {
    flex: 1,
    width: SCREEN_WIDTH,
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: {
    backgroundColor: colors.white,
    width: 20,
    borderRadius: 4,
  },
  contentSection: {
    padding: 16,
    gap: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#131413',
    lineHeight: 28,
  },
  titleBookmark: {
    padding: 4,
  },
  priceSection: {
    marginTop: 4,
  },
  priceText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  descriptionSection: {
    gap: 8,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131413',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  contactInfoSection: {
    gap: 12,
  },
  contactInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131413',
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactInfoText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  sellerSection: {
    gap: 12,
  },
  sellerSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#131413',
  },
  sellerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sellerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sellerAvatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#131413',
    marginBottom: 4,
  },
  sellerCareer: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
