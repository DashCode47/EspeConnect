import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BenefitsStackParamList } from '../../../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../../config/colors';
import { useHideNavbar } from "../../../../hooks/useHideNavbar";
import { Promotion } from '../../domain/entities/establishment.entity';
import { Establishment } from '../../domain/entities/establishment.entity';
import EstablishmentModal from '../components/EstablishmentModal';

interface RouteParams {
  data: {
    promotion: Promotion;
    establishment: Establishment;
  };
}

const BenefitDetail = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<BenefitsStackParamList, 'BenefitDetails'>>();
  const navigation = useNavigation();
  const { data } = (route.params || {}) as RouteParams;
  const promotion = data?.promotion;
  const establishment = data?.establishment;
  const [isFavorite, setIsFavorite] = useState(false);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);

  useHideNavbar(true);

  if (!establishment) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#64748B' }}>Detalles no disponibles</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginTop: 20, padding: 10, backgroundColor: colors.primary, borderRadius: 8 }}
        >
          <Text style={{ color: 'white' }}>Volver</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

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

  // Helper function to get category icon
  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'FOOD': 'food',
      'DRINKS': 'cup',
      'EVENTS': 'calendar-star',
      'PARTIES': 'party-popper',
      'OTHER': 'tag',
    };
    return iconMap[category] || 'tag';
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

  console.log(establishment);
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Simplified Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>

        {/* Hero Image Section with Decorative Elements */}
        <View style={styles.heroSection}>
          {/* Decorative blob */}
          <View style={styles.decorativeBlob} />

          <View style={styles.imageWrapper}>
            {/* Gradient Overlay */}
            <View style={styles.imageGradient} />

            {establishment?.imageUrl || promotion?.imageUrl ? (
              <Image
                source={{ uri: establishment?.imageUrl || promotion?.imageUrl }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="image" size={64} color="#D9D9D9" />
              </View>
            )}

            {/* Floating Discount Badge */}
            {promotion?.discount !== undefined && promotion?.discount !== null && promotion?.discount > 0 && (
              <View style={styles.discountBadge}>
                <MaterialCommunityIcons name="percent" size={20} color={colors.primary} />
                <Text style={styles.discountBadgeText}>{promotion.discount}% OFF</Text>
              </View>
            )}
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          {promotion?.title ? (
            <Text style={styles.title}>
              {promotion.title}
            </Text>
          ) : (
            <Text style={styles.title}>
              {establishment.name}
            </Text>
          )}

          {/* Category and Expiration Chips */}
          <View style={styles.chipsContainer}>
            {establishment?.type && (
              <View style={styles.categoryChip}>
                <MaterialCommunityIcons
                  name={getCategoryIcon(establishment?.type)}
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.categoryChipText}>{getCategoryName(establishment?.type)}</Text>
              </View>
            )}

            {/* {promotion?.endDate && (
              <View style={styles.expirationChip}>
                <MaterialCommunityIcons name="clock-outline" size={18} color="#64748B" />
                <Text style={styles.expirationChipText}>Vence el: {formatDate(promotion.endDate)}</Text>
              </View>
            )} */}
          </View>
        </View>

        {/* Description Section */}
        {promotion.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.description}>
              {promotion.description}
            </Text>
          </View>
        )}

        {/* Establishment Card */}
        {establishment.name && (
          <View style={styles.establishmentSection}>
            <Text style={styles.sectionLabel}>DISPONIBLE EN</Text>

            <TouchableOpacity
              style={styles.establishmentCard}
              onPress={() => setShowEstablishmentModal(true)}
              activeOpacity={0.7}>
              <View style={styles.establishmentLeft}>
                <View style={styles.establishmentAvatar}>
                  {establishment?.imageUrl ? (
                    <Image
                      source={{ uri: establishment.imageUrl }}
                      style={styles.establishmentAvatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialCommunityIcons name="store" size={24} color="#94A3B8" />
                  )}
                </View>
                <View style={styles.establishmentInfo}>
                  <Text style={styles.establishmentName} numberOfLines={1}>
                    {establishment?.name}
                  </Text>
                  {establishment?.address && (
                    <Text style={styles.establishmentAddress} numberOfLines={1}>
                      {establishment.address}
                    </Text>
                  )}
                </View>
              </View>
              <View style={styles.chevronButton}>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Terms Preview */}
        <View style={styles.termsSection}>
          <View style={styles.termsContent}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#94A3B8" />
            <Text style={styles.termsText}>
              Aplican términos y condiciones. Beneficio sujeto a disponibilidad y políticas del establecimiento.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Establishment Modal */}
      <EstablishmentModal
        visible={showEstablishmentModal}
        onClose={() => setShowEstablishmentModal(false)}
        establishment={establishment}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  heroSection: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    position: 'relative',
  },
  decorativeBlob: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 128,
    height: 128,
    backgroundColor: 'rgba(247, 182, 52, 0.2)',
    borderRadius: 64,
    transform: [{ translateX: 32 }, { translateY: -32 }],
  },
  imageWrapper: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 40,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#105b39',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  discountBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  discountBadgeText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 38,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryChip: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 91, 57, 0.1)',
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 91, 57, 0.05)',
  },
  categoryChipText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  expirationChip: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingLeft: 12,
    paddingRight: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  expirationChipText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  description: {
    fontSize: 18,
    fontWeight: '400',
    color: '#475569',
    lineHeight: 28,
  },
  establishmentSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 2,
    paddingHorizontal: 4,
    marginBottom: 12,
  },
  establishmentCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  establishmentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  establishmentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  establishmentAvatarImage: {
    width: '100%',
    height: '100%',
  },
  establishmentInfo: {
    flex: 1,
  },
  establishmentName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 2,
  },
  establishmentAddress: {
    fontSize: 14,
    fontWeight: '400',
    color: '#64748B',
  },
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  termsContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  ctaButton: {
    width: '100%',
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaAccent: {
    position: 'absolute',
    left: -16,
    top: -16,
    width: 48,
    height: 48,
    backgroundColor: 'rgba(247, 182, 52, 0.2)',
    borderRadius: 24,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default BenefitDetail;
