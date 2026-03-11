import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../../../navigation/types';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles, FONT_FAMILY } from '../../../../config/globalStyles';
import { navigationRef } from '../../../../navigation/RootNavigator';
import { BENEFIT_DETAILS, BENEFIT_STACK } from '../../../../config/constants';
import { HorizontalIcon } from '../../../../assets/svg/HorizontalIcon';
import useHome from '../hooks/useHome';
import { track } from '../../../../analytics/track';
import { AnalyticsEvents } from '../../../../analytics/events';
import { EstablishmentCategories } from '../../../establishments/presentation/components/EstablishmentCategories';
import { BenefitCard } from '../../../establishments/presentation/components/BenefitCard';
import EstablishmentModal from '../../../establishments/presentation/components/EstablishmentModal';
import { HomeSkeletonLoader } from '../components/HomeSkeletonLoader';
import { Establishment, Promotion } from '../../../establishments/domain/entities/establishment.entity';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [promotionsWithEstablishments, setPromotionsWithEstablishments] = useState<Array<{ promotion: Promotion; establishment: Establishment }>>([]);

  const {
    profile,
    getClosestEvent,
    fetchEstablishments,
    establishments,
    establishmentsLoading,
    fetchActiveBanners,
    banners,
    bannersLoading,
  } = useHome();

  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);

  useEffect(() => {
    fetchEstablishments({ limit: 100 });
    getClosestEvent();
    fetchActiveBanners();
    track(AnalyticsEvents.HOME_SCREEN_VIEWED);
  }, []);

  useEffect(() => {
    console.log('Total Establishments:', establishments.length);
    if (establishments.length > 0) {
      const promotionsData: Array<{ promotion: Promotion; establishment: Establishment }> = [];
      establishments.forEach(establishment => {
        console.log(`Establishment ${establishment.name} has ${establishment.promotions?.length} promos`);
        (establishment.promotions || []).filter(p => p.isActive).forEach(promotion => {
          promotionsData.push({ promotion, establishment });
        });
      });
      console.log('Total valid promotions found:', promotionsData.length);
      setPromotionsWithEstablishments(promotionsData.slice(0, 10));
    }
  }, [establishments]);

  if (establishmentsLoading || bannersLoading) {
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

      <View style={styles.bgBlobContainer} pointerEvents="none">
        <View style={styles.bgBlobPrimary} />
        <View style={styles.bgBlobAccent} />
      </View>

      <View style={styles.topNavBar}>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => {
            track(AnalyticsEvents.HOME_PROFILE_TAPPED);
            navigation.navigate('Profile');
          }}>
          {profile?.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.profileAvatar}
            />
          ) : (
            <View style={styles.profileAvatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={26} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <HorizontalIcon width={120} height={20} />
        </View>

        {/* <TouchableOpacity style={styles.notificationButton}>
          <MaterialCommunityIcons name="bell" size={24} color={colors.white} />
          <View style={styles.notificationDot} />
        </TouchableOpacity> */}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: globalStyles.getBottomSafeArea(insets) + 20,
        }}
        showsVerticalScrollIndicator={false}>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>
            Bienvenido, {profile?.name || 'Usuario'}
          </Text>
          <Text style={styles.welcomeSubtitle}>
            {profile?.career || 'Estudiante'}
          </Text>
        </View>

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
                  onPress={() => track(AnalyticsEvents.HOME_BANNER_TAPPED, { bannerId: banner.id })}
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
                  <View style={styles.bannerCardGradient} />
                  {/* <View style={styles.bannerCardContent}>
                    <Text style={styles.bannerCardTitle} numberOfLines={2}>
                      {banner.title}
                    </Text>
                    {banner.description ? (
                      <Text style={styles.bannerCardDescription} numberOfLines={2}>
                        {banner.description}
                      </Text>
                    ) : null}
                  </View> */}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <EstablishmentCategories establishments={establishments} />

        <View style={styles.benefitsSection}>
          <View style={styles.benefitsHeader}>
            <View style={styles.benefitsHeaderRow}>
              <View>
                <Text style={styles.benefitsTitle}>Beneficios estudiantiles</Text>
                <Text style={styles.benefitsSubtitle}>Aprovecha los descuentos que tenemos para ti</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  track(AnalyticsEvents.HOME_BENEFITS_SEE_ALL);
                  navigation.navigate(BENEFIT_STACK as any);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.seeAllText}>Ver todos</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.benefitsList}>
            {promotionsWithEstablishments.length > 0 ? (
              promotionsWithEstablishments.map((item) => (
                <BenefitCard
                  key={`${item.establishment.id}-${item.promotion.id}`}
                  promotion={item.promotion}
                  establishment={item.establishment}
                  onPress={() => {
                    track(AnalyticsEvents.HOME_BENEFIT_TAPPED, {
                      promotionId: item.promotion.id,
                      establishmentId: item.establishment.id,
                      establishmentName: item.establishment.name,
                    });
                    navigationRef.current?.navigate(BENEFIT_STACK, {
                      screen: BENEFIT_DETAILS,
                      params: { data: { promotion: item.promotion, establishment: item.establishment } },
                    });
                  }}
                />
              ))
            ) : (
              <View style={styles.emptyBenefitsContainer}>
                <MaterialCommunityIcons name="ticket-percent-outline" size={40} color="#CBD5E1" />
                <Text style={styles.emptyBenefitsText}>No hay beneficios activos en este momento</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

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
    backgroundColor: '#f6f8f7',
    paddingTop: 30,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  profileAvatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: `${colors.primary}40`,
  },
  logoContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
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
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    marginBottom: 16,
  },
  benefitsSection: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 24,
  },
  benefitsHeader: {
    marginBottom: 16,
  },
  benefitsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllButton: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: `${colors.primary}99`,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  benefitsTitle: {
    fontSize: 22,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  benefitsSubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#6B7280',
    marginTop: 2,
  },
  benefitsList: {
    gap: 0, // Gaps handled by BenefitCard margin
  },
  promotionChipText: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 14,
  },
  emptyBenefitsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: `${colors.primary}0D`,
    borderStyle: 'dashed',
  },
  emptyBenefitsText: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#94A3B8',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#6B7280',
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
    opacity: 0.1,
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
    fontFamily: FONT_FAMILY.BOLD,
    color: '#fff',
    marginBottom: 4,
    lineHeight: 26,
  },
  bannerCardDescription: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
});
