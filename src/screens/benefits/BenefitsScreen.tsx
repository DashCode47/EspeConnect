import React, { useEffect, useState, useRef } from 'react';
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
import { promotionService, Promotion } from '../../services/promotion.service';
import { establishmentService, Establishment } from '../../services/establishment.service';
import { BENEFIT_DETAILS } from '../../config/constants';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import EstablishmentModal from '../../components/EstablishmentModal';

type BenefitsScreenNavigationProp = NativeStackNavigationProp<BenefitsStackParamList>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PromotionCardProps {
  promotion: Promotion;
  establishment: Establishment;
  onPress: () => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({ promotion, establishment, onPress }) => {
  // Helper function to format category name
  const getCategoryName = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'FOOD': 'Comida',
      'DRINKS': 'Bebidas',
      'EVENTS': 'Eventos',
      'PARTIES': 'Fiestas',
      'OTHER': 'Otros',
    };
    return categoryMap[category] || category;
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  // Check if promotion is still active based on dates
  const isCurrentlyActive = () => {
    try {
      const now = new Date();
      const startDate = new Date(promotion.startDate);
      const endDate = new Date(promotion.endDate);
      return now >= startDate && now <= endDate && promotion.isActive;
    } catch {
      return promotion.isActive;
    }
  };

  return (
    <TouchableOpacity style={styles.promotionCard} onPress={onPress}>
      {/* Header */}
      <View style={styles.promotionCardHeader}>
        <View style={styles.promotionCardHeaderLeft}>
          {promotion.discount !== undefined && promotion.discount > 0 ? (
            <View style={styles.promotionCardDiscountIcon}>
              <MaterialCommunityIcons name="tag" size={20} color={colors.primary} />
              <Text style={styles.promotionCardDiscountIconText}>
                -{promotion.discount}%
              </Text>
            </View>
          ) : (
            <View style={styles.promotionCardAvatarPlaceholder}>
              <MaterialCommunityIcons name="store" size={20} color={colors.primary} />
            </View>
          )}
          <View>
            {establishment.name ? (
              <Text style={styles.promotionCardTitle} numberOfLines={1}>
                {establishment.name}
              </Text>
            ) : null}
            {promotion.category ? (
              <Text style={styles.promotionCardCategory}>
                {getCategoryName(promotion.category)}
              </Text>
            ) : null}
          </View>
        </View>
        <TouchableOpacity>
          <MaterialCommunityIcons name="bookmark-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Image - Main Large Image */}
      {establishment.imageUrl ? (
        <Image source={{ uri: establishment.imageUrl }} style={styles.promotionCardImage} resizeMode="cover" />
      ) : (
        <View style={styles.promotionCardImagePlaceholder}>
          <MaterialCommunityIcons name="image" size={48} color="#ccc" />
        </View>
      )}

      {/* Description */}
      {promotion.description ? (
        <View style={styles.promotionCardDescriptionContainer}>
          <Text style={styles.promotionCardDescriptionText} numberOfLines={2}>
            {promotion.description}
          </Text>
        </View>
      ) : null}

      {/* Details */}
      <View style={styles.promotionCardDetails}>
        {establishment.address ? (
          <View style={styles.promotionCardDetailItem}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.error} />
            <Text style={styles.promotionCardDetailText} numberOfLines={1}>
              {establishment.address}
            </Text>
          </View>
        ) : null}
        
        {promotion.startDate ? (
          <View style={styles.promotionCardDetailItem}>
            <MaterialCommunityIcons name="calendar" size={16} color={colors.accent} />
            <Text style={styles.promotionCardDetailText} numberOfLines={1}>
              {formatDate(promotion.startDate)}
            </Text>
          </View>
        ) : null}
        
        {promotion.endDate ? (
          <View style={styles.promotionCardDetailItem}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color={colors.black} />
            <Text style={styles.promotionCardDetailText} numberOfLines={1}>
              Hasta {formatDate(promotion.endDate)}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Action Buttons */}
      <View style={styles.promotionCardActions}>
        {/* {promotion.discount !== undefined && promotion.discount > 0 ? (
          <TouchableOpacity style={styles.promotionCardButtonOutline}>
            <Text style={styles.promotionCardButtonOutlineText}>
              -{promotion.discount}% {isCurrentlyActive() ? 'hoy' : ''}
            </Text>
          </TouchableOpacity>
        ) : null} */}
        {promotion.discount !== undefined && promotion.discount > 0 ? (
          <TouchableOpacity style={styles.promotionCardButton}>
            <Text style={styles.promotionCardButtonText}>
              -{promotion.discount}%
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

interface TrendingProductProps {
  title: string;
  imageUrl?: string;
  currentPrice: number;
  originalPrice: number;
  onPress: () => void;
}

const TrendingProductCard: React.FC<TrendingProductProps> = ({
  title,
  imageUrl,
  currentPrice,
  originalPrice,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.trendingCard} onPress={onPress}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.trendingImage} resizeMode="cover" />
      ) : (
        <View style={styles.trendingImagePlaceholder}>
          <MaterialCommunityIcons name="image" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.trendingContent}>
        <Text style={styles.trendingTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.trendingPriceContainer}>
          <Text style={styles.trendingCurrentPrice}>${currentPrice.toFixed(2)}</Text>
          <Text style={styles.trendingOriginalPrice}>${originalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.freeDeliveryBadge}>
          <Text style={styles.freeDeliveryText}>Domicilio gratis</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

interface NearbyBusinessCardProps {
  establishment: Establishment;
  onPress: () => void;
}

const NearbyBusinessCard: React.FC<NearbyBusinessCardProps> = ({ establishment, onPress }) => {
  return (
    <TouchableOpacity style={styles.nearbyCard} onPress={onPress}>
      {establishment.imageUrl ? (
        <Image source={{ uri: establishment.imageUrl }} style={styles.nearbyImage} resizeMode="cover" />
      ) : (
        <View style={styles.nearbyImagePlaceholder}>
          <MaterialCommunityIcons name="store" size={40} color="#ccc" />
        </View>
      )}
      <View style={styles.nearbyContent}>
        <Text style={styles.nearbyTitle} numberOfLines={1}>
          {establishment.name}
        </Text>
        {establishment.address && (
          <Text style={styles.nearbyAddress} numberOfLines={1}>
            {establishment.address}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export const BenefitsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BenefitsScreenNavigationProp>();
  const [promotionsWithEstablishments, setPromotionsWithEstablishments] = useState<Array<{promotion: Promotion; establishment: Establishment}>>([]);
  const [establishmentsWithoutPromotions, setEstablishmentsWithoutPromotions] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [activePromoIndex, setActivePromoIndex] = useState(0);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);
  const promoCarouselRef = useRef<ICarouselInstance>(null);

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
        const activePromotions = establishment.promotions.filter(promo => {
          try {
            const now = new Date();
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            return now >= startDate && now <= endDate && promo.isActive;
          } catch {
            return promo.isActive;
          }
        });
        
        if (activePromotions.length > 0) {
          establishmentsWithPromos.push(establishment);
        } else {
          establishmentsWithoutPromos.push(establishment);
        }
      });
      
      // Extract all promotions with their establishments
      const allPromotionsData: Array<{promotion: Promotion; establishment: Establishment}> = [];
      establishmentsWithPromos.forEach(establishment => {
        const activePromotions = establishment.promotions.filter(promo => {
          try {
            const now = new Date();
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            return now >= startDate && now <= endDate && promo.isActive;
          } catch {
            return promo.isActive;
          }
        });
        
        activePromotions.forEach(promotion => {
          allPromotionsData.push({promotion, establishment});
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
      setEstablishmentsWithoutPromotions(establishmentsWithoutPromos);
    } catch (error) {
      console.error('Error fetching establishments:', error);
      setPromotionsWithEstablishments([]);
      setEstablishmentsWithoutPromotions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoSnapToItem = (index: number) => {
    setActivePromoIndex(index);
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

        {/* Ofertas Principales Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¡Por ser estudiante!</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersChipsContainer}>
            <View style={styles.offerChip}>
              <Text style={styles.offerChipText}>10% OFF</Text>
            </View>
            <View style={styles.offerChip}>
              <Text style={styles.offerChipText}>2x3</Text>
            </View>
            <View style={[styles.offerChip, styles.offerChipLimited]}>
              <Text style={styles.offerChipText}>Limitado</Text>
            </View>
            <View style={[styles.offerChip, styles.offerChipToday]}>
              <Text style={styles.offerChipText}>Solo hoy</Text>
            </View>
          </ScrollView>
        </View>

          {/* Productos en Tendencia Section */}
          <View style={styles.section}>
          <Text style={styles.sectionTitle}>Productos en tendencia</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : promotionsWithEstablishments && promotionsWithEstablishments.length > 0 ? (
            <>
              <Carousel
                ref={promoCarouselRef}
                loop={promotionsWithEstablishments.length > 1}
                width={SCREEN_WIDTH - 40}
                height={490}
                data={promotionsWithEstablishments}
                renderItem={({ item }: { item: {promotion: Promotion; establishment: Establishment} }) => (
                  <View style={styles.promotionCardWrapper}>
                    <PromotionCard
                      promotion={item.promotion}
                      establishment={item.establishment}
                      onPress={() =>
                        navigation.navigate(BENEFIT_DETAILS, {
                          data: {promotion: item.promotion, establishment: item.establishment},
                        })
                      }
                    />
                  </View>
                )}
                onSnapToItem={handlePromoSnapToItem}
                autoPlay={promotionsWithEstablishments.length > 1}
                autoPlayInterval={4000}
                enabled={promotionsWithEstablishments.length > 1}
                defaultIndex={0}
              />
              {/* Pagination Dots */}
              {promotionsWithEstablishments.length > 1 && (
                <View style={styles.promotionPaginationContainer}>
                  {promotionsWithEstablishments.map((_, index) => (
                    <View
                      key={`promo-dot-${index}`}
                      style={[
                        styles.promotionPaginationDot,
                        index === activePromoIndex && styles.promotionPaginationDotActive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="store-off" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No hay promociones disponibles</Text>
            </View>
          )}
        </View>

        {/* Comercios Cercanos Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Comercios cercanos</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : establishmentsWithoutPromotions && establishmentsWithoutPromotions.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.nearbyContainer}>
              {establishmentsWithoutPromotions.map((establishment) => {
                // For establishments without promotions, navigate to the first available promotion
                const handlePress = () => {
                  if (promotionsWithEstablishments.length > 0) {
                    // Navigate to the first promotion available
                    const firstPromo = promotionsWithEstablishments[0];
                    navigation.navigate(BENEFIT_DETAILS, {
                      data: firstPromo,
                    });
                  }
                };

                return (
                  <NearbyBusinessCard
                    key={establishment.id}
                    establishment={establishment}
                    onPress={() => {
                      setSelectedEstablishment(establishment);
                      setShowEstablishmentModal(true);
                    }}
                  />
                );
              })}
            </ScrollView>
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="store-off" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No hay comercios disponibles</Text>
            </View>
          )}
        </View>

      
      </ScrollView>

      {/* Establishment Modal */}
      {selectedEstablishment && (
        <EstablishmentModal
          visible={showEstablishmentModal}
          onClose={() => {
            setShowEstablishmentModal(false);
            setSelectedEstablishment(null);
          }}
          establishment={selectedEstablishment}
        />
      )}
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
  nearbyContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
  },
  nearbyCard: {
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
  nearbyImage: {
    width: '100%',
    height: 120,
  },
  nearbyImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nearbyContent: {
    padding: 12,
  },
  nearbyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  nearbyAddress: {
    fontSize: 12,
    color: '#666',
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

