import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BenefitsStackParamList } from '../../navigation/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../config/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Promotion } from '../../services/promotion.service';
import { establishmentService, Establishment } from '../../services/establishment.service';
import { BENEFIT_DETAILS } from '../../config/constants';

type BenefitsScreenNavigationProp = NativeStackNavigationProp<BenefitsStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Masonry benefit card aspect ratios for variety
const ASPECT_RATIOS = [1.25, 1, 0.75, 0.8, 1] as const;

interface MasonryBenefitCardProps {
  promotion: Promotion;
  establishment: Establishment;
  aspectRatio: number;
  badgeRotation?: number;
  onPress: () => void;
}

const MasonryBenefitCard: React.FC<MasonryBenefitCardProps> = ({
  promotion,
  establishment,
  aspectRatio,
  badgeRotation = 0,
  onPress,
}) => {
  const cardWidth = (SCREEN_WIDTH - 48) / 2; // 2 columns with padding
  const imageHeight = cardWidth * aspectRatio;

  const getDiscountLabel = () => {
    if (promotion?.discount !== undefined && promotion?.discount !== null && promotion.discount > 0) {
      return `${promotion.discount}% OFF`;
    }
    if (promotion?.title?.includes('2x1')) return '2x1';
    return null;
  };

  return (
    <TouchableOpacity
      style={[styles.masonryCard, { width: cardWidth }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image Container */}
      <View style={[styles.masonryImageContainer, { height: imageHeight }]}>
        {establishment.imageUrl ? (
          <Image
            source={{ uri: establishment.imageUrl }}
            style={styles.masonryImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.masonryImagePlaceholder}>
            <MaterialCommunityIcons name="store" size={48} color="#ccc" />
          </View>
        )}

        {/* Discount Badge */}
        {getDiscountLabel() && (
          <View
            style={[
              styles.masonryBadge,
              { transform: [{ rotate: `${badgeRotation}deg` }] },
            ]}
          >
            <Text style={styles.masonryBadgeText}>{getDiscountLabel()}</Text>
          </View>
        )}

        {/* Gradient Overlay */}
        <View style={styles.masonryGradient} />
      </View>

      {/* Content */}
      <View style={styles.masonryContent}>
        <Text style={styles.masonryTitle} numberOfLines={1}>
          {establishment.name}
        </Text>
        <Text style={styles.masonrySubtitle} numberOfLines={1}>
          {promotion.title || 'Promoción especial'}
        </Text>

        {/* Footer with distance and action */}
        <View style={styles.masonryFooter}>
          {establishment.address ? (
            <View style={styles.masonryDistance}>
              <MaterialCommunityIcons name="map-marker" size={14} color="#999" />
              <Text style={styles.masonryDistanceText} numberOfLines={1}>{establishment.address}</Text>
            </View>
          ) : <View />}
          <TouchableOpacity style={styles.masonryActionButton} onPress={onPress}>
            <MaterialCommunityIcons name="arrow-right" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const BenefitsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BenefitsScreenNavigationProp>();
  const [promotionsWithEstablishments, setPromotionsWithEstablishments] = useState<Array<{ promotion: Promotion; establishment: Establishment }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  const categories = ['Todos', 'Comida', 'Bebidas', 'Entretenimiento', 'Otros'];

  useEffect(() => {
    fetchEstablishments();
  }, [selectedCategory]);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      // Fetch all establishments from Supabase
      const response = await establishmentService.getEstablishments();

      // Response structure from Supabase: { establishments, pagination }
      const establishments = response.establishments || [];

      // Separate establishments: with and without promotions
      const establishmentsWithPromos: Establishment[] = [];
      const establishmentsWithoutPromos: Establishment[] = [];

      establishments.forEach(establishment => {
        const activePromotions = (establishment.promotions || []).filter(promo => {
          try {
            const now = new Date();
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            return now >= startDate && now <= endDate && (promo.isActive || promo.is_active);
          } catch {
            return promo.isActive || promo.is_active;
          }
        });

        if (activePromotions.length > 0) {
          establishmentsWithPromos.push(establishment);
        } else {
          establishmentsWithoutPromos.push(establishment);
        }
      });

      // Extract all promotions with their establishments
      const allPromotionsData: Array<{ promotion: Promotion; establishment: Establishment }> = [];
      establishmentsWithPromos.forEach(establishment => {
        const activePromotions = establishment.promotions.filter(promo => {
          try {
            const now = new Date();
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            return now >= startDate && now <= endDate && (promo.isActive || promo.is_active);
          } catch {
            return promo.isActive || promo.is_active;
          }
        });

        activePromotions.forEach(promotion => {
          allPromotionsData.push({ promotion, establishment });
        });
      });


      // Filter by category if not "Todos"
      const categoryMap: { [key: string]: string } = {
        'Todos': '',
        'Comida': 'FOOD',
        'Bebidas': 'DRINKS',
        'Entretenimiento': 'EVENTS',
        'Otros': 'OTHER',
      };

      const categoryFilter = categoryMap[selectedCategory] || '';
      const filtered = selectedCategory === 'Todos'
        ? allPromotionsData
        : allPromotionsData.filter(item => item.promotion.category === categoryFilter);

      setPromotionsWithEstablishments(filtered);
    } catch (error) {
      console.error('Error fetching establishments:', error);
      setPromotionsWithEstablishments([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Text style={styles.headerTitle}>Beneficios</Text>
      </View>

      <ScrollView
        style={styles.scrollView} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>

        {/* Category Slider */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categorySlider}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryChip,
                selectedCategory === category && styles.categoryChipActive,
              ]}
              onPress={() => setSelectedCategory(category)}>
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === category && styles.categoryChipTextActive,
                ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Beneficios Grid - Masonry Style */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Todos los beneficios</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : promotionsWithEstablishments && promotionsWithEstablishments.length > 0 ? (
            <View style={styles.masonryContainer}>
              {/* Left Column */}
              <View style={styles.masonryColumn}>
                {promotionsWithEstablishments
                  .filter((_, index) => index % 2 === 0)
                  .map((item, index) => (
                    <MasonryBenefitCard
                      key={`${item.establishment.id}-${item.promotion.id}`}
                      promotion={item.promotion}
                      establishment={item.establishment}
                      aspectRatio={ASPECT_RATIOS[index % ASPECT_RATIOS.length]}
                      badgeRotation={index % 2 === 0 ? 3 : -2}
                      onPress={() =>
                        navigation.navigate(BENEFIT_DETAILS, {
                          data: { promotion: item.promotion, establishment: item.establishment },
                        })
                      }
                    />
                  ))}
              </View>
              {/* Right Column */}
              <View style={styles.masonryColumn}>
                {promotionsWithEstablishments
                  .filter((_, index) => index % 2 === 1)
                  .map((item, index) => (
                    <MasonryBenefitCard
                      key={`${item.establishment.id}-${item.promotion.id}`}
                      promotion={item.promotion}
                      establishment={item.establishment}
                      aspectRatio={ASPECT_RATIOS[(index + 2) % ASPECT_RATIOS.length]}
                      badgeRotation={index % 2 === 0 ? -1 : 2}
                      onPress={() =>
                        navigation.navigate(BENEFIT_DETAILS, {
                          data: { promotion: item.promotion, establishment: item.establishment },
                        })
                      }
                    />
                  ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="tag-off" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No hay beneficios disponibles</Text>
            </View>
          )}
        </View>


      </ScrollView>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131413',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  categorySlider: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  categoryChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    marginRight: 12,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#131413',
    marginBottom: 16,
  },
  offersChipsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  offerChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.primary,
    marginRight: 12,
  },
  offerChipLimited: {
    backgroundColor: colors.accent,
  },
  offerChipToday: {
    backgroundColor: colors.error,
  },
  offerChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  promotionCardWrapper: {
    width: SCREEN_WIDTH - 40,
    paddingHorizontal: 0,
    paddingBottom: 8,
  },
  promotionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promotionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  promotionCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  promotionCardAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  promotionCardAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionCardDiscountIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7F4',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  promotionCardDiscountIconText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  promotionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  promotionCardCategory: {
    fontSize: 12,
    color: '#999',
  },
  promotionCardImage: {
    width: '100%',
    height: 250,
  },
  promotionCardImagePlaceholder: {
    width: '100%',
    height: 250,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionCardDescriptionContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  promotionCardDescriptionText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    lineHeight: 20,
  },
  promotionCardDetails: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  promotionCardDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promotionCardDetailText: {
    fontSize: 14,
    color: colors.primaryDark,
  },
  promotionCardActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  promotionCardButtonOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionCardButtonOutlineText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
  },
  promotionCardButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionCardButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  // Masonry Grid Styles
  masonryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  masonryColumn: {
    flex: 1,
    gap: 12,
  },
  masonryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  masonryImageContainer: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  masonryImage: {
    width: '100%',
    height: '100%',
  },
  masonryImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  masonryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.accent,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  masonryBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primaryDark,
  },
  masonryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
  },
  masonryContent: {
    padding: 12,
    paddingTop: 8,
  },
  masonryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  masonrySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
    marginBottom: 8,
  },
  masonryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  masonryDistance: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  masonryDistanceText: {
    fontSize: 11,
    color: '#999',
    flexShrink: 1,
  },
  masonryActionButton: {
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  trendingCard: {
    width: 180,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  trendingImage: {
    width: '100%',
    height: 120,
  },
  trendingImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendingContent: {
    padding: 12,
    gap: 8,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    lineHeight: 20,
  },
  trendingPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  trendingCurrentPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  trendingOriginalPrice: {
    fontSize: 12,
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  freeDeliveryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: `${colors.success}20`,
  },
  freeDeliveryText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.success,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  promotionPaginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  promotionPaginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  promotionPaginationDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
});

