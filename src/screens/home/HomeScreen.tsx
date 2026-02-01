import React, {useEffect, useState} from 'react';
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
  TextInput,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../../navigation/types';
import {bannerService, Banner} from '../../services/bannerService';
import useHome from './Hooks/useHome';
import {eventService, Event, EventCategory} from '../../services/event.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {colors} from '../../config/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {globalStyles} from '../../config/globalStyles';
import {navigationRef} from '../../navigation/RootNavigator';
import {BENEFIT_DETAILS, BENEFIT_STACK} from '../../config/constants';
import {HomeSkeletonLoader} from '../../components/HomeSkeletonLoader';
import {promotionService, Promotion} from '../../services/promotion.service';
import {establishmentService, Establishment} from '../../services/establishment.service';
import { HorizontalIcon } from '../../assets/svg/HorizontalIcon';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

interface PromotionCardProps {
  promotion: Promotion;
  establishment: Establishment;
  onPress: () => void;
}

const PromotionCard: React.FC<PromotionCardProps> = ({promotion, establishment, onPress}) => {
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
    <TouchableOpacity style={styles.promotionCard} onPress={onPress} activeOpacity={0.9}>
      {/* Header */}
      <View style={styles.promotionCardHeader}>
        <View style={styles.promotionCardHeaderLeft}>
          {promotion.imageUrl ? (
            <Image
              source={{uri: promotion.imageUrl}}
              style={styles.promotionCardAvatar}
            />
          ) : (
            <View style={styles.promotionCardAvatarPlaceholder}>
              <MaterialCommunityIcons name="store" size={20} color={colors.primary} />
            </View>
          )}
          <View>
            {establishment.name ? (
              <Text style={styles.promotionCardRestaurantName} numberOfLines={1}>
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
          <MaterialCommunityIcons
            name="bookmark-outline"
            size={24}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Image - Main Large Image */}
      {establishment.imageUrl ? (
        <Image
          source={{uri: establishment.imageUrl}}
          style={styles.promotionCardImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.promotionCardImagePlaceholder}>
          <MaterialCommunityIcons name="image" size={48} color="#ccc" />
        </View>
      )}

      {/* Content Section */}
      <View style={styles.promotionCardContent}>
        {promotion.title ? (
          <Text style={styles.promotionCardMealTitle}>{promotion.title}</Text>
        ) : null}
        
        {promotion.description ? (
          <Text style={styles.promotionCardDescription} numberOfLines={2}>
            {promotion.description}
          </Text>
        ) : null}
        

        {/* Action Buttons */}
        <View style={styles.promotionCardActions}>
          {establishment.address ? (
            <TouchableOpacity style={styles.promotionCardButtonOutline}>
              <Text style={styles.promotionCardButtonOutlineText} numberOfLines={1}>
                {establishment.address}
              </Text>
            </TouchableOpacity>
          ) : null}
          {promotion.discount !== undefined && promotion.discount > 0 ? (
            <TouchableOpacity style={styles.promotionCardButton}>
              <Text style={styles.promotionCardButtonText}>
                -{promotion.discount}%
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [promotionsWithEstablishments, setPromotionsWithEstablishments] = useState<Array<{promotion: Promotion; establishment: Establishment}>>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const screenWidth = Dimensions.get('window').width;
  const {
    profile,
    getClosestEvent,
    closestEvent,
  } = useHome();

  useEffect(() => {
    fetchEstablishments();
    getClosestEvent();
    fetchBanners();
  }, []);

  const fetchEstablishments = async () => {
    try {
      setLoading(true);
      const response = await establishmentService.getEstablishments({
        hasActivePromotions: true,
      });

      const establishmentsData = response.establishments || [];
      setEstablishments(establishmentsData);
      
      // Extract all promotions with their establishments
      const promotionsData: Array<{promotion: Promotion; establishment: Establishment}> = [];
      establishmentsData.forEach(establishment => {
        establishment.promotions.forEach(promotion => {
          promotionsData.push({promotion, establishment});
        });
      });
      
      setPromotionsWithEstablishments(promotionsData.slice(0, 5));
    } catch (error) {
      console.error('Error fetching establishments:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchBanners = async () => {
    try {
      const bannersData = await bannerService.getAll();
      console.log('Raw banners data:', JSON.stringify(bannersData, null, 2));
      const activeBanners = bannersData.filter(banner => banner.isActive === true || banner.isActive === 'true' as any);
      console.log('Active banners:', JSON.stringify(activeBanners, null, 2));
      console.log('Banner image URLs:', activeBanners.map(b => b.imageUrl));
      setBanners(activeBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f6f8f7" />
        <HomeSkeletonLoader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f6f8f7" />

      {/* Background Blobs */}
      <View style={styles.bgBlobContainer} pointerEvents="none">
        <View style={styles.bgBlobPrimary} />
        <View style={styles.bgBlobAccent} />
      </View>

      {/* Top Navigation Bar */}
      <View style={styles.topNavBar}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}>
          {profile?.avatarUrl ? (
            <Image
              source={{uri: profile.avatarUrl}}
              style={styles.profileAvatar}
            />
          ) : (
            <View style={styles.profileAvatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <HorizontalIcon width={120} height={20} />
        </View>

        {/* Notifications Button */}
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialCommunityIcons name="bell" size={24} color={colors.white} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: globalStyles.getBottomSafeArea(insets) + 20,
        }}
        showsVerticalScrollIndicator={false}>
        
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Bienvenido, {profile?.name || 'Usuario'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {profile?.career || 'Estudiante'}
          </Text>
        </View>

        {/* Search Bar */}
        {/* <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <MaterialCommunityIcons
              name="magnify"
              size={20}
              color="#999"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <MaterialCommunityIcons name="tune" size={20} color={colors.white} />
          </TouchableOpacity>
        </View> */}

        {/* Banner Cards */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bannerScrollContent}
              snapToInterval={296}
              decelerationRate="fast"
            >
              {banners.map((banner) => (
                <TouchableOpacity
                  key={banner.id}
                  style={styles.bannerCard}
                  activeOpacity={0.9}
                >
                  {banner.imageUrl ? (
                    <Image
                      source={{ uri: banner.imageUrl }}
                      style={styles.bannerCardImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.bannerCardImage, styles.bannerCardImagePlaceholder]}>
                      <MaterialCommunityIcons name="image" size={48} color="rgba(255,255,255,0.5)" />
                    </View>
                  )}
                  {/* Gradient overlay */}
                  <View style={styles.bannerCardGradient} />
                  {/* Content */}
                  <View style={styles.bannerCardContent}>
                    <Text style={styles.bannerCardTitle} numberOfLines={2}>
                      {banner.title}
                    </Text>
                    {banner.description ? (
                      <Text style={styles.bannerCardDescription} numberOfLines={2}>
                        {banner.description}
                      </Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Promotions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Promociones</Text>
          {promotionsWithEstablishments.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promotionsChipsContainer}>
              {promotionsWithEstablishments.slice(0, 10).map((item) => (
                <TouchableOpacity
                  key={`${item.establishment.id}-${item.promotion.id}`}
                  style={styles.promotionChipContainer}
                  onPress={() =>
                    navigationRef.current?.navigate(BENEFIT_STACK, {
                      screen: BENEFIT_DETAILS,
                      params: { data: {promotion: item.promotion, establishment: item.establishment} },
                    })
                  }
                  activeOpacity={0.7}>
                  <View style={styles.promotionChipCircle}>
                    {item.establishment.imageUrl ? (
                      <Image
                        source={{ uri: item.establishment.imageUrl }}
                        style={styles.promotionChipImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.promotionChipPlaceholder}>
                        <MaterialCommunityIcons name="store" size={24} color={colors.primary} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.promotionChipText} numberOfLines={2}>
                    {item.promotion.title || item.establishment.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyPromotions}>
              <Text style={styles.emptyPromotionsText}>No hay promociones disponibles</Text>
            </View>
          )}
        </View>

        {/* Call to Action */}
        <View style={styles.section}>
          <Text style={styles.ctaTitle}>No las dejes pasar!</Text>
        </View>

        {/* Promotion Cards */}
        <View style={styles.promotionCardsSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promotionCardsContainer}
            pagingEnabled
            snapToInterval={screenWidth - 40}
            decelerationRate="fast">
            {promotionsWithEstablishments.length > 0 ? (
              promotionsWithEstablishments.map((item, index) => (
                <View key={`${item.establishment.id}-${item.promotion.id}`} style={styles.promotionCardWrapper}>
                  <PromotionCard
                    promotion={item.promotion}
                    establishment={item.establishment}
                    onPress={() =>
                      navigationRef.current?.navigate(BENEFIT_STACK, {
                        screen: BENEFIT_DETAILS,
                        params: {data: {promotion: item.promotion, establishment: item.establishment}},
                      })
                    }
                  />
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="store-off" size={48} color="#ccc" />
                <Text style={styles.emptyStateText}>No hay promociones disponibles</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Pagination Dots */}
        {promotionsWithEstablishments.length > 1 && (
          <View style={styles.paginationContainer}>
            {promotionsWithEstablishments.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === 0 && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f7',
    paddingTop: 20,
  },
  bgBlobContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 500,
    overflow: 'hidden',
    zIndex: 0,
  },
  bgBlobPrimary: {
    position: 'absolute',
    top: -80,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: `${colors.primary}1A`,
  },
  bgBlobAccent: {
    position: 'absolute',
    top: 40,
    right: -80,
    width: 288,
    height: 288,
    borderRadius: 144,
    backgroundColor: `${colors.accent}33`,
  },
  topNavBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  profileButton: {
    width: 40,
    height: 40,
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profileAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '700',
  },
  logoTextGreen: {
    color: colors.primary,
  },
  logoTextYellow: {
    color: colors.accent,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  searchSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primaryDark,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  promotionsChipsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingRight: 20,
  },
  promotionChipContainer: {
    alignItems: 'center',
    width: 80,
  },
  promotionChipCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  promotionChipImage: {
    width: '100%',
    height: '100%',
  },
  promotionChipPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  promotionChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 14,
  },
  emptyPromotions: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyPromotionsText: {
    fontSize: 14,
    color: '#999',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  promotionCardsSection: {
    marginBottom: 24,
    paddingBottom: 20,
  },
  promotionCardsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  promotionCardWrapper: {
    width: Dimensions.get('window').width - 40,
  },
  promotionCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primaryDark,
    shadowOffset: {width: 0, height: 2},
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
  promotionCardRestaurantName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  promotionCardCategory: {
    fontSize: 12,
    fontWeight: '500',
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
  promotionCardContent: {
    padding: 16,
  },
  promotionCardMealTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 8,
  },
  promotionCardDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  promotionCardPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  promotionCardCurrentPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  promotionCardOriginalPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  promotionCardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  promotionCardButtonOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success,
    backgroundColor: colors.white,
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
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    width: Dimensions.get('window').width - 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
  },
  bannerSection: {
    marginBottom: 24,
    paddingVertical: 4,
  },
  bannerScrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  bannerCard: {
    width: 280,
    height: 340,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  bannerCardImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  bannerCardImagePlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerCardGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    opacity: 0.55,
  },
  bannerCardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  bannerCardTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 26,
  },
  bannerCardDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
});
