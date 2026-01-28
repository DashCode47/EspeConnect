import React, { useState } from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { BenefitsStackParamList } from '../../navigation/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../config/colors';
import { useHideNavbar } from '../../hooks/useHideNavbar';
import { Promotion } from '../../services/promotion.service';
import { Establishment } from '../../services/establishment.service';
import EstablishmentModal from '../../components/EstablishmentModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const { data } = route.params as RouteParams;
  const promotion = data.promotion;
  const establishment = data.establishment;
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showEstablishmentModal, setShowEstablishmentModal] = useState(false);

  useHideNavbar(true);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons name="bell" size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookmarkButton}
            onPress={() => setIsBookmarked(!isBookmarked)}>
            <MaterialCommunityIcons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}>
        
        {/* Business/Vendor Card */}
        {(establishment.name || establishment.imageUrl) && (
          <TouchableOpacity 
            style={styles.businessCard}
            onPress={() => setShowEstablishmentModal(true)}
            activeOpacity={0.7}>
            <View style={styles.businessLeft}>
              <View style={styles.businessAvatar}>
                {establishment.imageUrl ? (
                  <Image source={{ uri: establishment.imageUrl }} style={styles.avatarImage} />
                ) : (
                  <MaterialCommunityIcons name="store" size={20} color="#666" />
                )}
              </View>
              <View style={styles.businessInfo}>
                {establishment.name ? (
                  <Text style={styles.businessName} numberOfLines={1}>
                    {establishment.name}
                  </Text>
                ) : null}
                {promotion.category ? (
                  <Text style={styles.businessCategory}>
                    {getCategoryName(promotion.category)}
                  </Text>
                ) : null}
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primaryDark} />
          </TouchableOpacity>
        )}

        {/* Product Image */}
        <View style={styles.imageContainer}>
          {establishment.imageUrl ? (
            <Image source={{ uri: establishment.imageUrl }} style={styles.productImage} resizeMode="cover" />
          ) : (
            <View style={styles.imagePlaceholder}>
              <MaterialCommunityIcons name="image" size={64} color="#D9D9D9" />
            </View>
          )}
        </View>

        {/* Info Row: Location, Start Date, End Date */}
        {(establishment.address || promotion.startDate || promotion.endDate) && (
          <View style={styles.infoRow}>
            {establishment.address ? (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="map-marker" size={12} color="#E95649" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {establishment.address}
                </Text>
              </View>
            ) : null}
            {promotion.startDate ? (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar" size={12} color={colors.accent} />
                <Text style={styles.infoText}>
                  {formatDate(promotion.startDate)}
                </Text>
              </View>
            ) : null}
            {promotion.endDate ? (
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="calendar-clock" size={13} color="#363636" />
                <Text style={styles.infoText}>
                  Hasta {formatDate(promotion.endDate)}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {/* Title */}
        {promotion.title ? (
          <Text style={styles.productTitle}>{promotion.title}</Text>
        ) : null}

        {/* Description */}
        {promotion.description ? (
          <Text style={styles.productDescription}>
            {promotion.description}
          </Text>
        ) : null}

        {/* Promotional Badges */}
        {(promotion.discount !== undefined && promotion.discount > 0) || establishment.address ? (
          <View style={styles.badgesContainer}>
            {promotion.discount !== undefined && promotion.discount > 0 ? (
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>
                  -{promotion.discount}% {isCurrentlyActive() ? 'hoy' : ''}
                </Text>
              </View>
            ) : null}
            {establishment.address ? (
              <View style={styles.promoBadge}>
                <Text style={styles.promoBadgeText}>{establishment.address}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {/* Price and Apply Button Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {promotion.discount !== undefined && promotion.discount > 0 ? (
          <View style={styles.priceContainer}>
            <Text style={styles.currentPrice}>
              -{promotion.discount}% {isCurrentlyActive() ? 'hoy' : ''}
            </Text>
          </View>
        ) : null}
        {promotion.discount !== undefined && promotion.discount > 0 ? (
          <TouchableOpacity style={styles.applyButton}>
            <Text style={styles.applyButtonText}>
              -{promotion.discount}%
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

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
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryDark,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  businessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBFBFB',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  businessLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  businessAvatar: {
    width: 28,
    height: 28,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  businessInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
    lineHeight: 17.6, // 16 * 1.1
    marginBottom: 2,
  },
  businessCategory: {
    fontSize: 8,
    fontWeight: '600',
    color: '#B6B6B6',
    lineHeight: 8.8, // 8 * 1.1
  },
  imageContainer: {
    width: SCREEN_WIDTH - 40,
    height: (SCREEN_WIDTH - 40) * 0.75,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#383938',
    letterSpacing: 2,
  },
  productTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  promoBadge: {
    height: 32,
    backgroundColor: '#F0F7F4',
    borderWidth: 1.5,
    borderColor: '#0E6940',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0E6940',
    lineHeight: 13.2, // 12 * 1.1
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FBFBFB',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 12,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  originalPrice: {
    fontSize: 16,
    fontWeight: '400',
    color: '#999',
    textDecorationLine: 'line-through',
  },
  applyButton: {
    height: 32,
    backgroundColor: '#0E6940',
    borderRadius: 10,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 13.2, // 12 * 1.1
  },
});

export default BenefitDetail;
