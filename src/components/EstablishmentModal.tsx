import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../config/colors';
import { Establishment } from '../services/establishment.service';
import { Promotion } from '../services/promotion.service';

interface EstablishmentModalProps {
  visible: boolean;
  onClose: () => void;
  establishment: Establishment;
}

const EstablishmentModal: React.FC<EstablishmentModalProps> = ({
  visible,
  onClose,
  establishment,
}) => {
  const insets = useSafeAreaInsets();

  const handlePhonePress = () => {
    if (establishment.phone) {
      Linking.openURL(`tel:${establishment.phone}`);
    }
  };

  const handleEmailPress = () => {
    if (establishment.email) {
      Linking.openURL(`mailto:${establishment.email}`);
    }
  };

  const handleWebsitePress = () => {
    if (establishment.website) {
      Linking.openURL(establishment.website);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FOOD':
        return 'food';
      case 'DRINKS':
        return 'cup';
      case 'EVENTS':
        return 'calendar';
      case 'OTHER':
        return 'tag';
      default:
        return 'tag';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'FOOD':
        return 'Comida';
      case 'DRINKS':
        return 'Bebidas';
      case 'EVENTS':
        return 'Entretenimiento';
      case 'OTHER':
        return 'Otros';
      default:
        return category;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { maxHeight: '90%' }]}>
          {/* Handle and Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.handleContainer}
              onPress={onClose}
              activeOpacity={0.7}>
              <View style={styles.handle} />
            </TouchableOpacity>

            <View style={styles.header}>
              <View style={styles.headerSpacer} />
              <Text style={styles.title} numberOfLines={1}>
                {establishment.name || 'Establecimiento'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                activeOpacity={0.7}>
                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: insets.bottom + 20 },
            ]}>
            {/* Description */}
            {establishment.description && (
              <Text style={styles.description}>{establishment.description}</Text>
            )}

            {/* Info List */}
            <View style={styles.infoList}>
              {/* Address */}
              {establishment.address && (
                <View style={styles.infoItem}>
                  <View style={styles.infoLeft}>
                    <View style={styles.infoIconContainer}>
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={24}
                        color={colors.primaryDark}
                      />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Dirección</Text>
                      <Text style={styles.infoValue} numberOfLines={2}>
                        {establishment.address}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#999"
                  />
                </View>
              )}

              {/* Contact (Phone) */}
              {establishment.phone && (
                <TouchableOpacity
                  style={styles.infoItem}
                  onPress={handlePhonePress}
                  activeOpacity={0.7}>
                  <View style={styles.infoLeft}>
                    <View style={styles.infoIconContainer}>
                      <MaterialCommunityIcons
                        name="phone"
                        size={24}
                        color={colors.primaryDark}
                      />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Contacto</Text>
                      <Text style={[styles.infoValue, styles.infoLink]} numberOfLines={2}>
                        {establishment.phone}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              )}

              {/* Email */}
              {establishment.email && (
                <TouchableOpacity
                  style={styles.infoItem}
                  onPress={handleEmailPress}
                  activeOpacity={0.7}>
                  <View style={styles.infoLeft}>
                    <View style={styles.infoIconContainer}>
                      <MaterialCommunityIcons
                        name="email"
                        size={24}
                        color={colors.primaryDark}
                      />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Email</Text>
                      <Text style={[styles.infoValue, styles.infoLink]} numberOfLines={2}>
                        {establishment.email}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              )}

              {/* Website */}
              {establishment.website && (
                <TouchableOpacity
                  style={styles.infoItem}
                  onPress={handleWebsitePress}
                  activeOpacity={0.7}>
                  <View style={styles.infoLeft}>
                    <View style={styles.infoIconContainer}>
                      <MaterialCommunityIcons
                        name="web"
                        size={24}
                        color={colors.primaryDark}
                      />
                    </View>
                    <View style={styles.infoTextContainer}>
                      <Text style={styles.infoLabel}>Sitio Web</Text>
                      <Text style={[styles.infoValue, styles.infoLink]} numberOfLines={2}>
                        {establishment.website.replace(/^https?:\/\//, '')}
                      </Text>
                    </View>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color="#999"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Divider */}
            {(establishment.address ||
              establishment.phone ||
              establishment.email ||
              establishment.website) &&
              establishment.promotions &&
              establishment.promotions.length > 0 && (
                <View style={styles.divider} />
              )}

            {/* Promotions Section */}
            {establishment.promotions && establishment.promotions.length > 0 && (
              <View style={styles.promotionsSection}>
                <Text style={styles.promotionsTitle}>Promociones para Estudiantes</Text>

                {establishment.promotions.map((promotion) => (
                  <View key={promotion.id} style={styles.promotionCard}>
                    <View style={styles.promotionCardContent}>
                      <View style={styles.promotionIconContainer}>
                        <MaterialCommunityIcons
                          name={getCategoryIcon(promotion.category)}
                          size={24}
                          color="#F59E0B"
                        />
                      </View>
                      <View style={styles.promotionTextContainer}>
                        <Text style={styles.promotionTitle}>
                          {promotion.title || 'Promoción'}
                        </Text>
                        {promotion.description && (
                          <Text style={styles.promotionDescription} numberOfLines={2}>
                            {promotion.description}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
    maxHeight: '90%',
  },
  topBar: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    justifyContent: 'space-between',
  },
  headerSpacer: {
    width: 48,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
    lineHeight: 22,
  },
  closeButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: '#374151',
    lineHeight: 24,
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
  },
  infoList: {
    paddingTop: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 72,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${colors.primary}33`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.primaryDark,
    lineHeight: 20,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.primary,
    lineHeight: 20,
  },
  infoLink: {
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
    marginVertical: 16,
  },
  promotionsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  promotionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
    lineHeight: 24,
    marginBottom: 16,
  },
  promotionCard: {
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: colors.white,
    padding: 16,
  },
  promotionCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  promotionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promotionTextContainer: {
    flex: 1,
  },
  promotionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    lineHeight: 20,
    marginBottom: 4,
  },
  promotionDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    lineHeight: 20,
  },
});

export default EstablishmentModal;

