import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  ImageBackground,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../../../config/colors';
import { useEventStore } from '../store/event.store';
import { EventCategory, Event } from '../../domain/entities/event.entity';
import { EventStackParamList } from '../../../../navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import { useHideNavbar } from '../../../../hooks/useHideNavbar';

type EventDetailScreenRouteProp = RouteProp<EventStackParamList, 'EventDetail'>;

export const EventDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<EventDetailScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const { eventId } = route.params;

  const { fetchEventById, attendEvent, cancelAttendance } = useEventStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendingLoading, setAttendingLoading] = useState(false);

  useHideNavbar(true);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    setLoading(true);
    const result = await fetchEventById(eventId);
    if (result) {
      setEvent(result);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getCategoryLabel = (category: EventCategory) => {
    switch (category) {
      case EventCategory.ACADEMIC: return 'Académico';
      case EventCategory.SPORTS: return 'Deportivo';
      case EventCategory.SOCIAL: return 'Social';
      case EventCategory.PRIVATE: return 'Privado';
      case EventCategory.OTHER: return 'Otro';
      default: return 'Evento';
    }
  };

  const handleMapPress = () => {
    if (event?.location) {
      const encodedLocation = encodeURIComponent(event.location);
      const url = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
      Linking.openURL(url);
    }
  };

  const handleAttend = async () => {
    if (!event) return;

    setAttendingLoading(true);
    const success = event.isAttending
      ? await cancelAttendance(event.id)
      : await attendEvent(event.id);

    if (success) {
      // Refresh local state
      const updatedEvent = await fetchEventById(event.id);
      if (updatedEvent) setEvent(updatedEvent);
    }
    setAttendingLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="calendar-remove" size={64} color="#ccc" />
          <Text style={styles.errorText}>Evento no encontrado</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {event.imageUrl ? (
            <ImageBackground
              source={{ uri: event.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover">
              <LinearGradient
                colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.15)']}
                style={StyleSheet.absoluteFillObject}
              />
            </ImageBackground>
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <MaterialCommunityIcons name="calendar-star" size={80} color="rgba(255,255,255,0.4)" />
            </View>
          )}

          {/* Floating Back & Share Buttons */}
          <View style={[styles.heroButtonsRow, { top: insets.top + 12 }]}>
            <TouchableOpacity
              style={styles.heroButton}
              onPress={() => navigation.goBack()}>
              <MaterialCommunityIcons name="arrow-left" size={22} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Card (overlapping hero) */}
        <View style={styles.contentCard}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>
              {getCategoryLabel(event.category)}
            </Text>
          </View>

          {/* Event Title */}
          <Text style={styles.eventTitle}>{event.title}</Text>

          {/* Date / Time / Location Row */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="calendar-month" size={18} color={colors.primary} />
              <Text style={styles.infoText}>{formatDate(event.startTime)}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
              <Text style={styles.infoText}>{formatTime(event.startTime)}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.primary} />
              <Text style={styles.infoText} numberOfLines={1}>{event.location}</Text>
            </View>
          </View>

          {/* Attendees count */}
          {event.attendeesCount > 0 && (
            <View style={styles.attendeesRow}>
              <MaterialCommunityIcons name="account-group-outline" size={18} color="#888" />
              <Text style={styles.attendeesText}>
                {event.attendeesCount} {event.attendeesCount === 1 ? 'asistente confirmado' : 'asistentes confirmados'}
              </Text>
            </View>
          )}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>
              {event.description || 'No hay descripción disponible.'}
            </Text>
          </View>

          {/* Price info */}
          {event.price > 0 && (
            <View style={styles.priceRow}>
              <MaterialCommunityIcons name="ticket-outline" size={20} color={colors.primary} />
              <Text style={styles.priceLabel}>Entrada:</Text>
              <Text style={styles.priceValue}>${event.price.toFixed(2)}</Text>
            </View>
          )}

          {/* Map Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ubicación</Text>
            <TouchableOpacity style={styles.mapPlaceholder} onPress={handleMapPress} activeOpacity={0.8}>
              <View style={styles.mapContent}>
                <View style={styles.mapPinContainer}>
                  <MaterialCommunityIcons name="map-marker" size={32} color={colors.primary} />
                </View>
                <Text style={styles.mapLocationText} numberOfLines={2}>{event.location}</Text>
                <Text style={styles.mapHint}>Toca para abrir en Maps</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Organizer Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Organizador</Text>
            <View style={styles.organizerCard}>
              <View style={styles.organizerAvatar}>
                {event.creator.avatarUrl ? (
                  <Image
                    source={{ uri: event.creator.avatarUrl }}
                    style={styles.organizerAvatarImage}
                  />
                ) : (
                  <MaterialCommunityIcons name="account" size={28} color={colors.primary} />
                )}
              </View>
              <View style={styles.organizerInfo}>
                <Text style={styles.organizerName}>{event.creator.name}</Text>
                <Text style={styles.organizerLabel}>
                  {event.creator.career || 'Organizador'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.attendButton, event.isAttending && styles.attendButtonActive]}
          onPress={handleAttend}
          disabled={attendingLoading}
          activeOpacity={0.85}>
          {attendingLoading ? (
            <ActivityIndicator size="small" color={event.isAttending ? colors.white : colors.primaryDark} />
          ) : (
            <>
              <MaterialCommunityIcons
                name={event.isAttending ? 'check-circle' : 'ticket-confirmation-outline'}
                size={22}
                color={event.isAttending ? colors.white : colors.primaryDark}
              />
              <Text style={[styles.attendButtonText, event.isAttending && styles.attendButtonTextActive]}>
                {event.isAttending ? 'Te interesa' : 'Me interesa'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8f7',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#999',
  },

  // Hero
  heroContainer: {
    position: 'relative',
    width: '100%',
    height: 360,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
    overflow: 'hidden',
  },
  heroPlaceholder: {
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroButtonsRow: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content Card
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    marginTop: -40,
    marginHorizontal: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },

  // Category Badge
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Title
  eventTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 16,
    letterSpacing: -0.5,
  },

  // Info Row (date / time / location)
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f8f7',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
    flexShrink: 1,
  },
  infoDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },

  // Attendees
  attendeesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  attendeesText: {
    fontSize: 13,
    color: '#888',
  },

  // Sections
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 12,
  },

  // Description
  descriptionText: {
    fontSize: 15,
    lineHeight: 24,
    color: '#555',
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: `${colors.primary}10`,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },

  // Map
  mapPlaceholder: {
    backgroundColor: '#eaf4ef',
    borderRadius: 20,
    overflow: 'hidden',
    height: 140,
  },
  mapContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  mapPinContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLocationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mapHint: {
    fontSize: 12,
    color: '#999',
  },

  // Organizer
  organizerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#f6f8f7',
    borderRadius: 16,
    padding: 14,
  },
  organizerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  organizerAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  organizerInfo: {
    flex: 1,
  },
  organizerName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  organizerLabel: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.97)',
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  attendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.accent,
    borderRadius: 20,
    paddingVertical: 16,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  attendButtonActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
  },
  attendButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  attendButtonTextActive: {
    color: colors.white,
  },
});
