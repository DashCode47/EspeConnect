import React from 'react';
import { StyleSheet, TouchableOpacity, Image, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Post } from '../services/post.service';
import { colors } from '../config/colors';

interface MarketplaceCardProps {
  post: Post;
  onPress: () => void;
}

export const MarketplaceCard = ({ post, onPress }: MarketplaceCardProps) => {
  // Extract price from content or title if available
  // Assuming price might be in title or content, we'll parse it
  const extractPrice = (): string | null => {
    // Try to find price pattern in title or content
    const priceMatch = (post.title || post.content).match(/\$?(\d+\.?\d*)/);
    if (priceMatch) {
      return `$${parseFloat(priceMatch[1]).toFixed(2)}`;
    }
    return null;
  };

  const price = extractPrice();
  
  // Extract category from content or use a default
  const getCategory = (): string => {
    // You might want to add a category field to Post interface
    // For now, we'll use a placeholder or extract from content
    return 'Categoría';
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {post.imageUrl ? (
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>Sin imagen</Text>
          </View>
        )}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {post.title || post.content.substring(0, 30)}
        </Text>
        {price && (
          <Text style={styles.price}>{price}</Text>
        )}
        <Text style={styles.category}>{getCategory()}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: '#999',
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    marginTop: 4,
  },
  category: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

