import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View, Text, Dimensions } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Product } from '../services/marketplace.service';
import { colors } from '../config/colors';

interface MarketplaceCardProps {
  product: Product;
  onPress: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

// Helper to format price
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Helper to get category label
const getCategoryLabel = (category: string) => {
  const categoryMap: { [key: string]: string } = {
    'BOOKS': 'Libros',
    'UNIFORMS': 'Uniformes',
    'TECHNOLOGY': 'Tecnología',
    'HOME': 'Hogar',
    'OTHER': 'Otros',
  };
  return categoryMap[category] || category;
};

export const MarketplaceCard = ({ product, onPress }: MarketplaceCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="image" size={40} color="#D9D9D9" />
          </View>
        )}
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{getCategoryLabel(product.category)}</Text>
        </View>
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.title}
        </Text>

        {/* Price */}
        <Text style={styles.priceText}>{formatPrice(product.price)}</Text>

        {/* Profile Picture and Contact Button */}
        <View style={styles.footer}>
          <View style={styles.profileContainer}>
            <View style={styles.profileImagePlaceholder}>
              <MaterialCommunityIcons name="account" size={12} color="#666" />
            </View>
          </View>
          <TouchableOpacity
            style={styles.contactButton}
            onPress={(e) => {
              e.stopPropagation();
              // Handle contact action
            }}>
            <Text style={styles.contactButtonText}>Contactar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: '100%',
    height: CARD_WIDTH * 0.75,
    backgroundColor: '#F5F5F5',
    position: 'relative',
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
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.white,
  },
  productInfo: {
    padding: 12,
    gap: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
    lineHeight: 20,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  profileContainer: {
    width: 24,
    height: 24,
  },
  profileImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  profileImagePlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
