import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { Event, EventCategory } from '../../domain/entities/event.entity';

const FEATURED_CARD_WIDTH = 260;

const getCategoryLabel = (category: EventCategory): string => {
  const labels: Record<EventCategory, string> = {
    [EventCategory.ALL]: 'Todos',
    [EventCategory.ACADEMIC]: 'Académico',
    [EventCategory.SPORTS]: 'Deportes',
    [EventCategory.SOCIAL]: 'Social',
    [EventCategory.PRIVATE]: 'Privado',
    [EventCategory.OTHER]: 'Otro',
  };
  return labels[category] || 'Evento';
};

const formatShortDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

interface FeaturedEventCardProps {
  item: Event;
  index: number;
  onPress: (eventId: string) => void;
}

export const FeaturedEventCard = ({ item, index, onPress }: FeaturedEventCardProps) => {
  const isEven = index % 2 === 0;

  return (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => onPress(item.id)}
      activeOpacity={0.9}>
      <View style={[
        styles.featuredCardInner,
        isEven ? styles.featuredCardRoundedLeft : styles.featuredCardRoundedRight,
      ]}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.featuredImage} resizeMode="cover" />
        ) : (
          <View style={[styles.featuredImagePlaceholder, { backgroundColor: colors.primary }]}>
            <MaterialCommunityIcons name="calendar-star" size={64} color="rgba(255,255,255,0.3)" />
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.featuredGradient}
        />
        {index === 0 && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>DESTACADO</Text>
          </View>
        )}
        <View style={styles.featuredContent}>
          <Text style={styles.featuredCategory}>
            {getCategoryLabel(item.category).toUpperCase()}
          </Text>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.featuredDateRow}>
            <MaterialCommunityIcons name="calendar-month" size={16} color="rgba(255,255,255,0.9)" />
            <Text style={styles.featuredDateText}>{formatShortDate(item.startTime)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  featuredCard: {
    width: FEATURED_CARD_WIDTH,
    marginRight: 16,
  },
  featuredCardInner: {
    width: '100%',
    aspectRatio: 4 / 5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  featuredCardRoundedLeft: {
    borderTopLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  featuredCardRoundedRight: {
    borderTopRightRadius: 32,
    borderBottomLeftRadius: 32,
    borderTopLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  featuredImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  featuredBadgeText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
    letterSpacing: 1,
  },
  featuredContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  featuredCategory: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.accent,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  featuredTitle: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
    lineHeight: 28,
    marginBottom: 8,
  },
  featuredDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  featuredDateText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: 'rgba(255,255,255,0.9)',
  },
});
