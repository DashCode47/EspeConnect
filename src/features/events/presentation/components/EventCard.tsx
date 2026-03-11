import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { Event, EventCategory } from '../../domain/entities/event.entity';

const getCategoryType = (category: EventCategory): string => {
  const types: Record<EventCategory, string> = {
    [EventCategory.ALL]: 'Evento',
    [EventCategory.ACADEMIC]: 'Charla',
    [EventCategory.SPORTS]: 'Deportes',
    [EventCategory.SOCIAL]: 'Social',
    [EventCategory.PRIVATE]: 'Privado',
    [EventCategory.OTHER]: 'Taller',
  };
  return types[category] || 'Evento';
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatTimeRange = (startDate: string, endDate: string | null) => {
  const start = formatTime(startDate);
  if (endDate) return `${start} - ${formatTime(endDate)} hrs`;
  return `${start} hrs`;
};

interface EventCardProps {
  event: Event;
  onPress: (eventId: string) => void;
  onAttend: (eventId: string, isAttending: boolean) => void;
}

export const EventCard = ({ event, onPress, onAttend }: EventCardProps) => {
  return (
    <TouchableOpacity
      style={styles.eventCard}
      onPress={() => onPress(event.id)}
      activeOpacity={0.8}>
      <View style={styles.eventCardContent}>
        <View style={styles.eventImageContainer}>
          {event.imageUrl ? (
            <Image source={{ uri: event.imageUrl }} style={styles.eventImage} resizeMode="cover" />
          ) : (
            <View style={[styles.eventImagePlaceholder, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="calendar" size={32} color="rgba(255,255,255,0.5)" />
            </View>
          )}
        </View>

        <View style={styles.eventDetails}>
          <View style={styles.eventHeaderRow}>
            <Text style={styles.eventTitle} numberOfLines={2}>
              {event.title}
            </Text>
            <View style={styles.eventTypeBadge}>
              <Text style={styles.eventTypeBadgeText}>
                {getCategoryType(event.category)}
              </Text>
            </View>
          </View>

          <View style={styles.eventInfoContainer}>
            <View style={styles.eventInfoRow}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.accent} />
              <Text style={styles.eventInfoText}>
                {formatTimeRange(event.startTime, event.endTime)}
              </Text>
            </View>
            <View style={styles.eventInfoRow}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.accent} />
              <Text style={styles.eventInfoText} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.attendButton, event.isAttending && styles.attendButtonActive]}
        onPress={() => onAttend(event.id, event.isAttending)}
        activeOpacity={0.8}>
        <Text style={[styles.attendButtonText, event.isAttending && styles.attendButtonTextActive]}>
          {event.isAttending ? 'Ya no me interesa' : 'Me interesa'}
        </Text>
        <MaterialCommunityIcons
          name={event.isAttending ? 'check-circle' : 'check-circle-outline'}
          size={18}
          color={event.isAttending ? colors.primary : colors.primaryDark}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  eventCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    gap: 12,
  },
  eventCardContent: {
    flexDirection: 'row',
    gap: 16,
  },
  eventImageContainer: {
    width: 96,
    height: 112,
    borderRadius: 12,
    overflow: 'hidden',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  eventImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventDetails: {
    flex: 1,
    paddingVertical: 4,
  },
  eventHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    flex: 1,
    lineHeight: 22,
    marginRight: 8,
  },
  eventTypeBadge: {
    backgroundColor: `${colors.primary}1A`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eventTypeBadgeText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  eventInfoContainer: {
    marginTop: 'auto',
    gap: 6,
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventInfoText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
    flex: 1,
  },
  attendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    gap: 8,
  },
  attendButtonActive: {
    backgroundColor: `${colors.primary}1A`,
  },
  attendButtonText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  attendButtonTextActive: {
    color: colors.primary,
  },
});
