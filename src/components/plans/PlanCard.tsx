import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Plan, PlanCategory } from '../../types/plan.types';
import { colors } from '../../config/colors';
import { FONT_FAMILY } from '../../config/globalStyles';

interface PlanCardProps {
  plan: Plan;
  onPress: () => void;
  onJoin: () => void;
}

// Map category to icon and color
const getCategoryConfig = (category: PlanCategory) => {
  const configs: Record<PlanCategory, { icon: string; color: string; emoji: string }> = {
    [PlanCategory.CAFE]: { icon: 'coffee', color: '#FEF3C7', emoji: '☕' },
    [PlanCategory.FIESTA]: { icon: 'party-popper', color: '#FCE7F3', emoji: '🎉' },
    [PlanCategory.ESTUDIO]: { icon: 'book-open-variant', color: '#DBEAFE', emoji: '📚' },
    [PlanCategory.DEPORTE]: { icon: 'basketball', color: '#D1FAE5', emoji: '⚽' },
    [PlanCategory.CINE]: { icon: 'movie', color: '#E0E7FF', emoji: '🎬' },
    [PlanCategory.MUSICA]: { icon: 'music', color: '#FAE8FF', emoji: '🎵' },
    [PlanCategory.VIAJE]: { icon: 'airplane', color: '#FED7AA', emoji: '✈️' },
    [PlanCategory.COMIDA]: { icon: 'food', color: '#FEE2E2', emoji: '🍕' },
    [PlanCategory.OTRO]: { icon: 'star', color: '#E5E7EB', emoji: '⭐' },
  };
  return configs[category] || configs[PlanCategory.OTRO];
};

const getCategoryLabel = (category: PlanCategory): string => {
  const labels: Record<PlanCategory, string> = {
    [PlanCategory.CAFE]: 'Café',
    [PlanCategory.FIESTA]: 'Fiesta',
    [PlanCategory.ESTUDIO]: 'Estudio',
    [PlanCategory.DEPORTE]: 'Deporte',
    [PlanCategory.CINE]: 'Cine',
    [PlanCategory.MUSICA]: 'Música',
    [PlanCategory.VIAJE]: 'Viaje',
    [PlanCategory.COMIDA]: 'Comida',
    [PlanCategory.OTRO]: 'Otro',
  };
  return labels[category] || 'Otro';
};

export const PlanCard: React.FC<PlanCardProps> = ({ plan, onPress, onJoin }) => {
  const categoryConfig = getCategoryConfig(plan.category);
  const activeParticipants = plan.participants?.filter(p => p.left_at === null) || [];
  const participantAvatars = activeParticipants.slice(0, 3);
  const additionalCount = Math.max((plan.participantsCount || 0) - 3, 0);
  const hasParticipants = (plan.participantsCount || 0) > 0;

  // Format time
  const formatTime = (time: string) => {
    return time.slice(0, 5); // "HH:MM:SS" -> "HH:MM"
  };

  const timeDisplay = plan.end_time
    ? `${formatTime(plan.start_time)} - ${formatTime(plan.end_time)}`
    : formatTime(plan.start_time);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: categoryConfig.color }]}
      onPress={onPress}
      activeOpacity={0.9}>

      {/* Badge for featured/full plans */}
      {plan.isFull && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🔥 LLENO</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.emoji}>{categoryConfig.emoji}</Text>
        </View>

        {/* Title and subtitle */}
        <Text style={styles.title} numberOfLines={2}>
          {plan.title}
        </Text>
        <View style={styles.subtitleRow}>
          <Text style={styles.subtitle}>{getCategoryLabel(plan.category)}</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.subtitle}>{timeDisplay}</Text>
        </View>

        {/* Location if available */}
        {plan.location_name && (
          <View style={styles.locationRow}>
            <MaterialCommunityIcons name="map-marker" size={14} color="#6B7280" />
            <Text style={styles.locationText} numberOfLines={1}>
              {plan.location_name}
            </Text>
          </View>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        {/* Participants avatars */}
        <View style={styles.avatarsContainer}>
          {hasParticipants ? (
            <>
              {participantAvatars.map((p, index) => (
                p.user?.avatarUrl ? (
                  <Image
                    key={p.id}
                    source={{ uri: p.user.avatarUrl }}
                    style={[styles.avatar, { marginLeft: index > 0 ? -8 : 0 }]}
                  />
                ) : (
                  <View
                    key={p.id}
                    style={[styles.avatar, styles.avatarPlaceholder, { marginLeft: index > 0 ? -8 : 0 }]}>
                    <MaterialCommunityIcons name="account" size={14} color="#9CA3AF" />
                  </View>
                )
              ))}
              {additionalCount > 0 && (
                <Text style={styles.additionalCount}>+{additionalCount}</Text>
              )}
            </>
          ) : (
            <Text style={styles.noParticipants}>Sé el primero</Text>
          )}
        </View>

        {/* Join button */}
        {plan.isCreator ? (
          <View style={[styles.joinButton, styles.joinButtonCreator]}>
            <Text style={[styles.joinButtonText, styles.joinButtonTextCreator]}>Tu Plan</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.joinButton,
              plan.isParticipating && styles.joinButtonActive,
              plan.isFull && !plan.isParticipating && styles.joinButtonDisabled,
            ]}
            onPress={onJoin}
            disabled={plan.isFull && !plan.isParticipating}
            activeOpacity={0.8}>
            <Text style={[
              styles.joinButtonText,
              plan.isParticipating && styles.joinButtonTextActive,
            ]}>
              {plan.isParticipating ? '✓ Unido' : plan.isFull ? 'Lleno' : '¡Me uno!'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    minHeight: 220,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    transform: [{ rotate: '12deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  badgeText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#374151',
    letterSpacing: 0.5,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 22,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
  },
  dot: {
    fontSize: 13,
    color: '#6B7280',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    maxWidth: '100%',
  },
  locationText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  avatarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexShrink: 1,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarPlaceholder: {
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  additionalCount: {
    marginLeft: 8,
    fontSize: 12,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: '#9CA3AF',
  },
  noParticipants: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: '#9CA3AF',
  },
  joinButton: {
    backgroundColor: colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
    flexShrink: 0,
  },
  joinButtonCreator: {
    backgroundColor: `${colors.primary}15`,
    shadowOpacity: 0,
    elevation: 0,
  },
  joinButtonActive: {
    backgroundColor: `${colors.primary}20`,
  },
  joinButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  joinButtonText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  joinButtonTextCreator: {
    color: colors.primary,
  },
  joinButtonTextActive: {
    color: colors.primary,
  },
});
