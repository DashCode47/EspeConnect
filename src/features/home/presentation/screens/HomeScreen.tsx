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
import { globalStyles } from '../../../../config/globalStyles';
import { navigationRef } from '../../../../navigation/RootNavigator';
import { BENEFIT_DETAILS, BENEFIT_STACK } from '../../../../config/constants';
import { HorizontalIcon } from '../../../../assets/svg/HorizontalIcon';
import useHome from '../hooks/useHome';
import { EstablishmentCard } from '../../../establishments/presentation/components/EstablishmentCard';
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
    fetchEstablishments();
    getClosestEvent();
    fetchActiveBanners();
  }, []);

  useEffect(() => {
    if (establishments.length > 0) {
      const promotionsData: Array<{ promotion: Promotion; establishment: Establishment }> = [];
      establishments.forEach(establishment => {
        (establishment.promotions || []).filter(p => p.isActive).forEach(promotion => {
          promotionsData.push({ promotion, establishment });
        });
      });
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
          onPress={() => navigation.navigate('Profile')}>
          {profile?.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={styles.profileAvatar}
            />
          ) : (
            <View style={styles.profileAvatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <HorizontalIcon width={120} height={20} />
        </View>

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Establecimientos</Text>
        </View>
        <View style={styles.establishmentsList}>
          {establishments.length > 0 ? (
            establishments.map((establishment) => (
              <EstablishmentCard
                key={establishment.id}
                establishment={establishment}
                onPress={() => {
                  const firstPromotion = (establishment.promotions || []).find(p => p.isActive);
                  if (firstPromotion) {
                    navigationRef.current?.navigate(BENEFIT_STACK, {
                      screen: BENEFIT_DETAILS,
                      params: { data: { promotion: firstPromotion, establishment } },
                    });
                  } else {
                    setSelectedEstablishment(establishment);
                    setShowEstablishmentModal(true);
                  }
                }}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="store-off" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No hay establecimientos disponibles</Text>
            </View>
          )}
        </View>

        {promotionsWithEstablishments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beneficios activos</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.promotionsChipsContainer}>
              {promotionsWithEstablishments.map((item) => (
                <TouchableOpacity
                  key={`${item.establishment.id}-${item.promotion.id}`}
                  style={styles.promotionChipContainer}
                  onPress={() =>
                    navigationRef.current?.navigate(BENEFIT_STACK, {
                      screen: BENEFIT_DETAILS,
                      params: { data: { promotion: item.promotion, establishment: item.establishment } },
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
          </View>
        )}
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
  establishmentsList: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
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
