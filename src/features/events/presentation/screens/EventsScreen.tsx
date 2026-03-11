import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Text,
  RefreshControl,
  FlatList,
} from 'react-native';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from '../../../../config/colors';
import { globalStyles, FONT_FAMILY } from '../../../../config/globalStyles';
import { useEventStore } from '../store/event.store';
import { EventStackParamList } from '../../../../navigation/types';
import { PlansTab } from '../components/PlansTab';
import { PlanDetailSheet } from '../components/PlanDetailSheet';
import { usePlanStore } from '../store/plan.store';
import { EventsHeader } from '../components/EventsHeader';
import { EventsTabs, TabType } from '../components/EventsTabs';
import { FeaturedEventCard } from '../components/FeaturedEventCard';
import { EventCard } from '../components/EventCard';
import { CalendarStrip, CalendarDay } from '../components/CalendarStrip';

type EventsScreenNavigationProp = NativeStackNavigationProp<EventStackParamList, 'EventsList'>;

const FEATURED_CARD_WIDTH = 260;

const getDayName = (date: Date, isToday: boolean): string => {
  if (isToday) return 'HOY';
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return days[date.getDay()];
};

export const EventsScreen = () => {
  const navigation = useNavigation<EventsScreenNavigationProp>();
  const insets = useSafeAreaInsets();

  const { events, isLoading: loading, fetchEvents, attendEvent, cancelAttendance } = useEventStore();
  const { joinPlan, leavePlan, plans } = usePlanStore();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<TabType>('eventos');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [planSheetVisible, setPlanSheetVisible] = useState(false);
  const featuredScrollRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents();
    setRefreshing(false);
  }, [fetchEvents]);

  const featuredEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter(event => new Date(event.startTime) >= now)
      .sort((a, b) => b.attendeesCount - a.attendeesCount)
      .slice(0, 5);
  }, [events]);

  const calendarDays = useMemo((): CalendarDay[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDatesMap = new Map<string, number>();
    events.forEach(event => {
      const eventDate = new Date(event.startTime);
      eventDate.setHours(0, 0, 0, 0);
      if (eventDate >= today) {
        const dateKey = eventDate.toISOString().split('T')[0];
        eventDatesMap.set(dateKey, (eventDatesMap.get(dateKey) || 0) + 1);
      }
    });

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

  const eventsForSelectedDate = useMemo(() => {
    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDateStr = new Date(event.startTime).toISOString().split('T')[0];
      return eventDateStr === selectedDateStr;
    });
  }, [events, selectedDate]);

  useEffect(() => {
    if (calendarDays.length > 0 && !loading) {
      const todayDay = calendarDays.find(d => d.isToday);
      setSelectedDate(todayDay ? todayDay.date : calendarDays[0].date);
    }
  }, [calendarDays, loading]);

  const handleEventPress = (eventId: string) => {
    navigation.navigate('EventDetail', { eventId });
  };

  const handleAttendEvent = async (eventId: string, isAttending: boolean) => {
    if (isAttending) {
      await cancelAttendance(eventId);
    } else {
      await attendEvent(eventId);
    }
  };

  const handleCreateEvent = () => {
    navigation.navigate('CreateEvent');
  };

  const handlePlanPress = (planId: string) => {
    setSelectedPlanId(planId);
    setPlanSheetVisible(true);
  };

  const handleCreatePlan = () => {
    navigation.navigate('CreatePlan');
  };

  const handleClosePlanSheet = () => {
    setPlanSheetVisible(false);
    setTimeout(() => setSelectedPlanId(null), 300);
  };

  const handleJoinPlan = async () => {
    if (!selectedPlanId) return;
    const plan = plans.find(p => p.id === selectedPlanId);
    if (plan?.isParticipating) {
      await leavePlan(selectedPlanId);
    } else {
      await joinPlan(selectedPlanId);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F8F7" />

      <EventsHeader onCreatePress={activeTab === 'eventos' ? handleCreateEvent : handleCreatePlan} />
      <EventsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: globalStyles.getBottomSafeArea(insets) + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {activeTab === 'eventos' && (
          <>
            {featuredEvents.length > 0 && (
              <View style={styles.featuredSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Próximamente</Text>
                </View>
                <FlatList
                  ref={featuredScrollRef}
                  data={featuredEvents}
                  renderItem={({ item, index }) => (
                    <FeaturedEventCard item={item} index={index} onPress={handleEventPress} />
                  )}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.featuredList}
                  snapToInterval={FEATURED_CARD_WIDTH + 16}
                  decelerationRate="fast"
                />
              </View>
            )}

            {calendarDays.length > 0 && (
              <CalendarStrip
                days={calendarDays}
                selectedDate={selectedDate}
                onDaySelect={setSelectedDate}
              />
            )}

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
                  {eventsForSelectedDate.map(event => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onPress={handleEventPress}
                      onAttend={handleAttendEvent}
                    />
                  ))}
                </View>
              )}
            </View>
          </>
        )}

        {activeTab === 'planes' && (
          <PlansTab
            onPlanPress={handlePlanPress}
            onCreatePress={handleCreatePlan}
            onMyPlansPress={() => navigation.navigate('MyPlans')}
          />
        )}
      </ScrollView>

      <PlanDetailSheet
        planId={selectedPlanId}
        visible={planSheetVisible}
        onClose={handleClosePlanSheet}
        onJoin={handleJoinPlan}
        onViewComments={(id, title) => {
          navigation.navigate('PlanComments', { planId: id, planTitle: title });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F7',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
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
  featuredList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  eventsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  eventsList: {
    gap: 20,
  },
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
});
