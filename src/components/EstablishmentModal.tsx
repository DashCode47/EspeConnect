import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Linking,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Svg, Path } from 'react-native-svg';
import { colors } from '../config/colors';
import { Establishment } from '../services/establishment.service';

interface EstablishmentModalProps {
  visible: boolean;
  onClose: () => void;
  establishment: Establishment;
}

const TikTokIcon = ({ size = 24, color = "#000" }: { size?: number, color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M19.589 6.686a4.793 4.793 0 0 1-3.288-1.442 4.832 4.832 0 0 1-1.301-3.244h-3.049v13.791a2.894 2.894 0 1 1-3.111-2.873c.129-.001.258.006.386.021v-3.16a5.952 5.952 0 1 0 4.167 4.195l.001-8.156A7.835 7.835 0 0 0 19.589 9.3V6.686z"
      fill={color}
    />
  </Svg>
);

const EstablishmentModal: React.FC<EstablishmentModalProps> = ({
  visible,
  onClose,
  establishment,
}) => {
  const insets = useSafeAreaInsets();

  if (!establishment) return null;

  // Get category from first promotion if available
  const getCategory = () => {
    if (establishment.promotions && establishment.promotions.length > 0) {
      const category = establishment.promotions[0].category;
      const categoryMap: { [key: string]: string } = {
        'FOOD': 'Comida',
        'DRINKS': 'Bebidas',
        'EVENTS': 'Eventos',
        'PARTIES': 'Fiestas',
        'OTHER': 'Otros',
      };
      return categoryMap[category] || category;
    }
    return null;
  };

  const handleWhatsAppPress = () => {
    if (establishment.phone) {
      // Convert 09XXXXXXXX → 593XXXXXXXX
      const digits = establishment.phone.replace(/\D/g, '');
      const international = digits.startsWith('0') ? '593' + digits.slice(1) : digits;
      Linking.openURL(`https://wa.me/${international}`);
    }
  };

  const handleWebsitePress = () => {
    if (establishment.website) {
      Linking.openURL(establishment.website);
    }
  };

  const handleInstagramPress = () => {
    if (establishment.instagram) {
      const username = establishment.instagram.replace('@', '');
      Linking.openURL(`https://instagram.com/${username}`);
    }
  };

  const handleTikTokPress = () => {
    if (establishment.tiktok) {
      const username = establishment.tiktok.replace('@', '');
      Linking.openURL(`https://www.tiktok.com/@${username}`);
    }
  };


  const category = getCategory();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      {/* Dark Overlay */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Modal Container */}
        <Pressable
          style={[styles.modalContainer, { paddingBottom: insets.bottom + 32 }]}
          onPress={(e) => e.stopPropagation()}>
          {/* Drag Handle */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Modal Content */}
          <View style={styles.content}>
            {/* Store Header */}
            <View style={styles.header}>
              {/* Logo Avatar */}
              <View style={styles.avatarContainer}>
                <View style={styles.avatar}>
                  {establishment.imageUrl ? (
                    <Image
                      source={{ uri: establishment.imageUrl }}
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <MaterialCommunityIcons name="store" size={40} color="#94A3B8" />
                  )}
                </View>
              </View>

              {/* Store Info */}
              <View style={styles.storeInfo}>
                {/* Category Chip */}
                {category && (
                  <View style={styles.categoryContainer}>
                    <View style={styles.categoryChip}>
                      <Text style={styles.categoryText}>{category}</Text>
                    </View>
                  </View>
                )}

                {/* Store Name */}
                <Text style={styles.storeName} numberOfLines={2}>
                  {establishment.name}
                </Text>

                {/* Store Address/Subtitle */}
                {establishment.address && (
                  <Text style={styles.storeSubtitle} numberOfLines={1}>
                    {establishment.address}
                  </Text>
                )}
              </View>
            </View>

            {/* Description */}
            {establishment.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.description}>
                  {establishment.description}
                </Text>
              </View>
            )}

            {/* Social Media Row */}
            {(establishment.instagram || establishment.phone || establishment.website || establishment.tiktok) && (
              <View style={styles.socialRow}>
                {establishment.instagram && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleInstagramPress}
                    activeOpacity={0.7}>
                    <View style={[styles.socialIconContainer, styles.instagramBg]}>
                      <MaterialCommunityIcons name="instagram" size={28} color="#E1306C" />
                    </View>
                    <Text style={styles.socialLabel}>Instagram</Text>
                  </TouchableOpacity>
                )}

                {establishment.phone && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleWhatsAppPress}
                    activeOpacity={0.7}>
                    <View style={[styles.socialIconContainer, styles.whatsappBg]}>
                      <MaterialCommunityIcons name="whatsapp" size={28} color="#25D366" />
                    </View>
                    <Text style={styles.socialLabel}>WhatsApp</Text>
                  </TouchableOpacity>
                )}

                {establishment.website && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleWebsitePress}
                    activeOpacity={0.7}>
                    <View style={[styles.socialIconContainer, styles.websiteBg]}>
                      <MaterialCommunityIcons name="web" size={28} color="#3B82F6" />
                    </View>
                    <Text style={styles.socialLabel}>Web</Text>
                  </TouchableOpacity>
                )}

                {establishment.tiktok && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleTikTokPress}
                    activeOpacity={0.7}>
                    <View style={[styles.socialIconContainer, styles.tiktokBg]}>
                      <TikTokIcon size={24} color="#000000" />
                    </View>
                    <Text style={styles.socialLabel}>TikTok</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 48,
    borderTopRightRadius: 48,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 10,
  },
  dragHandleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  dragHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 8,
    gap: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  avatarContainer: {
    position: 'relative',
    flexShrink: 0,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  storeInfo: {
    flex: 1,
    paddingTop: 4,
  },
  categoryContainer: {
    marginBottom: 4,
  },
  categoryChip: {
    backgroundColor: 'rgba(46, 238, 130, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    color: '#104e33',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  storeName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111814',
    lineHeight: 30,
  },
  storeSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 2,
  },
  descriptionContainer: {
    backgroundColor: '#F6F8F7',
    padding: 16,
    borderRadius: 12,
  },
  description: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111814',
    lineHeight: 24,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
  },
  socialIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instagramBg: {
    backgroundColor: 'rgba(225, 48, 108, 0.1)',
  },
  whatsappBg: {
    backgroundColor: 'rgba(37, 211, 102, 0.1)',
  },
  websiteBg: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  tiktokBg: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  socialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default EstablishmentModal;
