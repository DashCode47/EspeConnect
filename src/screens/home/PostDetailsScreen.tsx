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
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../navigation/types';
import { Post } from '../../services/post.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../config/colors';
import { useHideNavbar } from '../../hooks/useHideNavbar';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';

type PostDetailsScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList, 'PostDetails'>;
type PostDetailsScreenRouteProp = RouteProp<HomeStackParamList, 'PostDetails'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const PostDetailsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<PostDetailsScreenNavigationProp>();
  const route = useRoute<PostDetailsScreenRouteProp>();
  const { postData } = route.params;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const carouselRef = useRef<ICarouselInstance>(null);

  // Ocultar el navbar en esta pantalla
  useHideNavbar(true);

  if (!postData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert" size={48} color={colors.primary} />
          <Text style={styles.errorText}>Post no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Parse images - if imageUrl exists, create array, otherwise empty
  const images = postData.imageUrl ? [postData.imageUrl] : [];
  
  // Extract price from content if it's a marketplace post
  const extractPrice = (content: string): string | null => {
    if (postData.type !== 'MARKETPLACE') return null;
    const priceMatch = content.match(/\$?(\d+\.?\d*)/);
    return priceMatch ? `$${parseFloat(priceMatch[1]).toFixed(2)}` : null;
  };

  const price = extractPrice(postData.content);

  const handleProgressChange = (progress: number) => {
    const newIndex = Math.round(progress);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const handleDotPress = (index: number) => {
    setActiveIndex(index);
    carouselRef.current?.scrollTo({ index, animated: true });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.black} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Detalle del Anuncio</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setIsBookmarked(!isBookmarked)}
        >
          <MaterialCommunityIcons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={24}
            color={colors.black}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Carousel */}
        {images.length > 0 ? (
          <View style={styles.carouselContainer}>
            <Carousel
              ref={carouselRef}
              loop={false}
              width={SCREEN_WIDTH}
              height={SCREEN_WIDTH * 0.5625} // 16:9 aspect ratio
              data={images}
              renderItem={({ item }) => (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: item }}
                    style={styles.carouselImage}
                    resizeMode="cover"
                  />
                </View>
              )}
              onProgressChange={handleProgressChange}
              enabled={images.length > 1}
              defaultIndex={0}
            />
            
            {/* Page Indicators */}
            {images.length > 1 && (
              <View style={styles.indicatorsContainer}>
                {images.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleDotPress(index)}
                    style={styles.indicatorWrapper}
                  >
                    <View
                      style={[
                        styles.indicator,
                        index === activeIndex && styles.indicatorActive,
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.imageContainer, styles.placeholderImage]}>
            <MaterialCommunityIcons name="image-off" size={64} color="#999" />
          </View>
        )}

        {/* Product Info */}
        <View style={styles.productInfo}>
          {postData.title && (
            <Text style={styles.productTitle}>{postData.title}</Text>
          )}
          
          {price && (
            <View style={styles.priceContainer}>
              <MaterialCommunityIcons name="tag" size={32} color={colors.secondary} />
              <Text style={styles.priceText}>{price}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descripción</Text>
          <Text style={styles.descriptionText}>{postData.content}</Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Seller Card */}
        <View style={styles.sellerSection}>
          <Text style={styles.sectionTitle}>Vendido por</Text>
          <View style={styles.sellerCard}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons
                name="account-circle"
                size={64}
                color={colors.primary}
              />
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{postData.author.name}</Text>
              <Text style={styles.sellerCareer}>
                {postData.author.username || 'Estudiante'}
              </Text>
              <Text style={styles.sellerDate}>
                Publicado: {formatDate(postData.createdAt)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky CTA Button */}
      <View style={[styles.stickyButtonContainer, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => {
            // TODO: Implement contact functionality
            console.log('Contact seller');
          }}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="chat" size={24} color={colors.white} />
          <Text style={styles.contactButtonText}>Contactar al Vendedor</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F5F5F5',
  },
  headerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  carouselContainer: {
    marginBottom: 16,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  indicatorWrapper: {
    padding: 4,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: `${colors.primary}4D`, // 30% opacity
  },
  indicatorActive: {
    backgroundColor: colors.primary,
  },
  productInfo: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  productTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.black,
    lineHeight: 38,
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: `${colors.secondary}33`, // accent/20 equivalent
    borderRadius: 12,
    padding: 12,
    alignSelf: 'flex-start',
  },
  priceText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.secondary,
  },
  descriptionSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#888888',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
    marginVertical: 24,
  },
  sellerSection: {
    paddingHorizontal: 16,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  sellerCareer: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 4,
  },
  sellerDate: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
  },
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: '#F5F5F5E6', // 90% opacity (backdrop blur effect)
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    gap: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
});
