import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  FlatList,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../config/colors';
import { globalStyles, FONT_FAMILY } from '../../config/globalStyles';
import { eventService, Event, EventCategory } from '../../services/event.service';
import { EventStackParamList } from '../../navigation/types';

type EventsScreenNavigationProp = NativeStackNavigationProp<EventStackParamList, 'EventsList'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FEATURED_CARD_WIDTH = 260;

interface CalendarDay {
  date: Date;
  dayNumber: number;
  dayName: string;
  isToday: boolean;
  hasEvents: boolean;
  eventCount: number;
}

// Helper function - defined outside component to avoid hoisting issues
const getDayName = (date: Date, isToday: boolean): string => {
  if (isToday) return 'HOY';
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

export const EventsScreen = () => {
  const navigation = useNavigation<EventsScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const featuredScrollRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await eventService.getEvents({
        page: 1,
        limit: 50,
      });
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEvents();
  }, []);

  // Get featured events (upcoming events with images or most attendees)
  const featuredEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.fechaInicio) >= now)
      .sort((a, b) => b.asistentesCount - a.asistentesCount)
      .slice(0, 5);
  }, [events]);

  // Get calendar days that have events
  const calendarDays = useMemo((): CalendarDay[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get unique dates with events
    const eventDatesMap = new Map<string, number>();
    events.forEach(event => {
      const eventDate = new Date(event.fechaInicio);
      eventDate.setHours(0, 0, 0, 0);
      // Only include future events or today's events
      if (eventDate >= today) {
        const dateKey = eventDate.toISOString().split('T')[0];
        eventDatesMap.set(dateKey, (eventDatesMap.get(dateKey) || 0) + 1);
      }
    });

    // Convert to sorted array of CalendarDay
    const days: CalendarDay[] = [];
    const sortedDates = Array.from(eventDatesMap.keys()).sort();

    sortedDates.forEach(dateKey => {
      const date = new Date(dateKey);
      const isToday = date.getTime() === today.getTime();

      days.push({
        date,
        dayNumber: date.getDate(),
        dayName: getDayName(date, isToday),
        isToday,
        hasEvents: true,
        eventCount: eventDatesMap.get(dateKey) || 0,
      });
    });

    // If no events, at least show today
    if (days.length === 0) {
      days.push({
        date: today,
        dayNumber: today.getDate(),
        dayName: 'HOY',
        isToday: true,
        hasEvents: false,
        eventCount: 0,
      });
    }

    return days;
  }, [events]);

  // Get events for selected date
  const eventsForSelectedDate = useMemo(() => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.fechaInicio);
      const eventDateStr = eventDate.toISOString().split('T')[0];
      return eventDateStr === selectedDateStr;
    });
  }, [events, selectedDate]);

  // Auto-select first day with events on load
  useEffect(() => {
    if (calendarDays.length > 0 && !loading) {
      const todayDay = calendarDays.find(d => d.isToday);
      if (todayDay) {
        setSelectedDate(todayDay.date);
      } else {
        setSelectedDate(calendarDays[0].date);
      }
    }
  }, [calendarDays, loading]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatTimeRange = (startDate: string, endDate: string | null) => {
    const start = formatTime(startDate);
    if (endDate) {
      const end = formatTime(endDate);
      return `${start} - ${end} hrs`;
    }
    return `${start} hrs`;
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    });
  };

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

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleAttendEvent = async (eventId: string, isAttending: boolean) => {
    try {
      if (isAttending) {
        await eventService.cancelAttendance(eventId);
      } else {
        await eventService.attendEvent(eventId);
      }
      // Refresh events to update attendance status
      fetchEvents();
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const renderFeaturedCard = ({ item, index }: { item: Event; index: number }) => {
    const isEven = index % 2 === 0;
    return (
      <TouchableOpacity
        style={styles.featuredCard}
        onPress={() => handleEventPress(item.id)}
        activeOpacity={0.9}>
        <View style={[
          styles.featuredCardInner,
          isEven ? styles.featuredCardRoundedLeft : styles.featuredCardRoundedRight,
        ]}>
          {item.imagen ? (
            <Image
              source={{ uri: item.imagen }}
              style={styles.featuredImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.featuredImagePlaceholder, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="calendar-star" size={64} color="rgba(255,255,255,0.3)" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.featuredGradient}
          />
          {/* Badge */}
          {index === 0 && (
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>DESTACADO</Text>
            </View>
          )}
          {/* Content */}
          <View style={styles.featuredContent}>
            <Text style={styles.featuredCategory}>
              {getCategoryLabel(item.categoria).toUpperCase()}
            </Text>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {item.nombre}
            </Text>
            <View style={styles.featuredDateRow}>
              <MaterialCommunityIcons name="calendar-month" size={16} color="rgba(255,255,255,0.9)" />
              <Text style={styles.featuredDateText}>{formatShortDate(item.fechaInicio)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCalendarDay = (day: CalendarDay) => {
    const isSelected = day.date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0];

    return (
      <TouchableOpacity
        key={day.date.toISOString()}
        style={[
          styles.calendarDay,
          day.isToday && isSelected && styles.calendarDayToday,
          isSelected && !day.isToday && styles.calendarDaySelected,
        ]}
        onPress={() => setSelectedDate(day.date)}
        activeOpacity={0.7}>
        <Text style={[
          styles.calendarDayName,
          (isSelected || day.isToday) && isSelected && styles.calendarDayNameActive,
        ]}>
          {day.dayName}
        </Text>
        <Text style={[
          styles.calendarDayNumber,
          (isSelected || day.isToday) && isSelected && styles.calendarDayNumberActive,
        ]}>
          {day.dayNumber}
        </Text>
        {day.hasEvents && isSelected && (
          <View style={styles.calendarDayDot} />
        )}
      </TouchableOpacity>
    );
  };

  const renderEventCard = (event: Event) => {
    return (
      <TouchableOpacity
        key={event.id}
        style={styles.eventCard}
        onPress={() => handleEventPress(event.id)}
        activeOpacity={0.8}>
        <View style={styles.eventCardContent}>
          {/* Image */}
          <View style={styles.eventImageContainer}>
            {event.imagen ? (
              <Image
                source={{ uri: event.imagen }}
                style={styles.eventImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.eventImagePlaceholder, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="calendar" size={32} color="rgba(255,255,255,0.5)" />
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.eventDetails}>
            <View style={styles.eventHeaderRow}>
              <Text style={styles.eventTitle} numberOfLines={2}>
                {event.nombre}
              </Text>
              <View style={styles.eventTypeBadge}>
                <Text style={styles.eventTypeBadgeText}>
                  {getCategoryType(event.categoria)}
                </Text>
              </View>
            </View>

            <View style={styles.eventInfoContainer}>
              <View style={styles.eventInfoRow}>
                <MaterialCommunityIcons name="clock-outline" size={18} color={colors.accent} />
                <Text style={styles.eventInfoText}>
                  {formatTimeRange(event.fechaInicio, event.fechaFin)}
                </Text>
              </View>
              <View style={styles.eventInfoRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={18} color={colors.accent} />
                <Text style={styles.eventInfoText} numberOfLines={1}>
                  {event.ubicacion}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.attendButton,
            event.isAttending && styles.attendButtonActive,
          ]}
          onPress={() => handleAttendEvent(event.id, event.isAttending)}
          activeOpacity={0.8}>
          <Text style={[
            styles.attendButtonText,
            event.isAttending && styles.attendButtonTextActive,
          ]}>
            {event.isAttending ? 'Asistiendo' : 'Asistir'}
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8F7" />

      {/* Header */}
      <View style={styles.header}>
        {/* <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>U</Text>
          </View>
        </View> */}
        <Text style={styles.headerTitle}>Eventos</Text>
        {/* <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View> */}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: globalStyles.getBottomSafeArea(insets) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Featured Section */}
        {featuredEvents.length > 0 && (
          <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Próximamente</Text>
              {/* <TouchableOpacity>
                <Text style={styles.seeAllText}>Ver todo</Text>
              </TouchableOpacity> */}
            </View>

            <FlatList
              ref={featuredScrollRef}
              data={featuredEvents}
              renderItem={renderFeaturedCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
              snapToInterval={FEATURED_CARD_WIDTH + 16}
              decelerationRate="fast"
            />
          </View>
        )}

        {/* Weekly Calendar Strip */}
        {calendarDays.length > 0 && (
          <View style={styles.calendarSection}>
            <Text style={styles.calendarTitle}>Calendario Semanal</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.calendarContainer}>
              {calendarDays.map(renderCalendarDay)}
            </ScrollView>
          </View>
        )}

        {/* Events Feed */}
        <View style={styles.eventsSection}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Cargando eventos...</Text>
            </View>
          ) : eventsForSelectedDate.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="calendar-blank" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No hay eventos</Text>
              <Text style={styles.emptySubtitle}>
                No hay eventos programados para esta fecha
              </Text>
              <TouchableOpacity
                style={styles.createEventButton}
                onPress={handleCreateEvent}
                activeOpacity={0.8}>
                <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                <Text style={styles.createEventButtonText}>Crear Evento</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.eventsList}>
              {eventsForSelectedDate.map(renderEventCard)}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreateEvent}
        activeOpacity={0.9}>
        <MaterialCommunityIcons name="plus" size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F7',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(246, 248, 247, 0.9)',
  },
  headerLeft: {
    width: 40,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ rotate: '-6deg' }],
  },
  logoText: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: `${colors.primary}1A`,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Featured Section
  featuredSection: {
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  seeAllText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  featuredList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
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

  // Calendar Section
  calendarSection: {
    paddingTop: 16,
  },
  calendarTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    paddingHorizontal: 20,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  calendarContainer: {
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 8,
  },
  calendarDay: {
    minWidth: 60,
    height: 72,
    backgroundColor: colors.white,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 12,
  },
  calendarDaySelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  calendarDayToday: {
    minWidth: 64,
    height: 84,
    backgroundColor: colors.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderColor: colors.primary,
    transform: [{ translateY: -4 }],
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  calendarDayName: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  calendarDayNameActive: {
    color: 'rgba(255,255,255,0.8)',
  },
  calendarDayNumber: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  calendarDayNumberActive: {
    color: colors.white,
    fontSize: 28,
  },
  calendarDayDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 4,
  },

  // Events Section
  eventsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  eventsList: {
    gap: 20,
  },

  // Event Card
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

  // Attend Button
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

  // Loading & Empty states
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  createEventButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: globalStyles.bottomNavigatorHeight + 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
});
