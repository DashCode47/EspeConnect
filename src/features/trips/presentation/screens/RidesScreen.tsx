import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { RideStackParamList } from '../../../../navigation/types';
import { Trip } from '../../domain/entities/trip.entity';
import { useAuthStore } from '../../../../features/auth/presentation/store/auth.store';
import { useTripStore } from '../store/trip.store';
import { globalStyles, FONT_FAMILY } from '../../../../config/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { track } from '../../../../analytics/track';
import { AnalyticsEvents } from '../../../../analytics/events';
import {
  TripCard,
  ActiveTripCard,
  TripSearchCard,
  OfferHeroCard,
  RidesTabToggle,
  RidesInfoModal,
  RidesHeader,
  type TravelMode
} from '../components';
import { RidesSkeletonLoader } from '../components/RidesSkeletonLoader';

type RidesScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'RidesList'>;

export const RidesScreen = () => {
  const navigation = useNavigation<RidesScreenNavigationProp>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { user: profile, fetchCurrentUser: fetchProfile } = useAuthStore();
  const { trips: allTrips, tripsLoading, myTrips: allMyTrips, myTripsLoading, fetchTrips, fetchMyTrips } = useTripStore();
  const [refreshing, setRefreshing] = useState(false);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [travelMode, setTravelMode] = useState<TravelMode>(route.params?.initialTab ?? 'search');
  const [infoModalVisible, setInfoModalVisible] = useState(false);

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
    track(AnalyticsEvents.RIDES_SCREEN_VIEWED);
    AsyncStorage.getItem('rides_disclaimer_seen').then(seen => {
      if (!seen) {
        setInfoModalVisible(true);
        AsyncStorage.setItem('rides_disclaimer_seen', '1');
      }
    });
  }, []);

  // Auto-refresh when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (profile?.id) {
        if (travelMode === 'offer') {
          fetchMyTrips(profile.id);
        } else {
          fetchTrips();
        }
      }
    }, [profile?.id, travelMode])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (profile?.id) {
      const promises = [fetchTrips()];
      if (travelMode === 'offer') {
        promises.push(fetchMyTrips(profile.id));
      }
      Promise.all(promises).finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  }, [profile?.id, travelMode]);

  const handleTravelModeChange = (mode: TravelMode) => {
    setTravelMode(mode);
    track(AnalyticsEvents.RIDES_TAB_CHANGED, { tab: mode });
  };

  const handleTripPress = (tripId: string) => {
    track(AnalyticsEvents.RIDES_TRIP_CARD_TAPPED, { tripId });
    navigation.navigate('TripDetail', { tripId });
  };

  const handleReserve = (tripId: string) => {
    track(AnalyticsEvents.RIDES_RESERVE_TAPPED, { tripId });
    navigation.navigate('TripDetail', { tripId });
  };

  const handleCreateTrip = () => {
    track(AnalyticsEvents.RIDES_PUBLISH_TAPPED);
    navigation.navigate('CreateTrip');
  };

  const handleCreateFromSearch = () => {
    track(AnalyticsEvents.RIDES_CREATE_FROM_SEARCH);
    navigation.navigate('CreateTrip');
  };

  const handleSearchTrips = () => {
    track(AnalyticsEvents.RIDES_SEARCH_TAPPED, { origin, destination });
    // In a real app, this would filter or fetch from API
  };

  const handleMyTrips = () => {
    track(AnalyticsEvents.RIDES_MY_TRIPS_TAPPED);
    navigation.navigate('MyTrips');
  };

  const handleActiveTripPress = (tripId: string) => {
    track(AnalyticsEvents.RIDES_ACTIVE_TRIP_TAPPED, { tripId });
    navigation.navigate('TripDetail', { tripId });
  };

  const handleManageTrip = (tripId: string) => {
    track(AnalyticsEvents.RIDES_MANAGE_TRIP_TAPPED, { tripId });
    navigation.navigate('ManageTripRequests', { tripId });
  };

  const handleEditTrip = (tripId: string) => {
    track(AnalyticsEvents.RIDES_EDIT_TRIP_TAPPED, { tripId });
    navigation.navigate('EditTrip', { tripId });
  };

  const trips = allTrips || [];
  const myTrips = allMyTrips || [];
  const loading = tripsLoading;
  const loadingMyTrips = myTripsLoading;

  const filteredTrips = trips.filter(trip => {
    const tripDate = new Date(trip.departureTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return (
      tripDate >= today &&
      trip.origin.toLowerCase().includes(origin.toLowerCase()) &&
      trip.destination.toLowerCase().includes(destination.toLowerCase())
    );
  });

  const filteredMyTrips = myTrips.filter(trip => {
    const tripDate = new Date(trip.departureTime);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return tripDate >= today;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <RidesHeader
        topInset={insets.top}
        onInfoPress={() => setInfoModalVisible(true)}
      />

      <RidesInfoModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: globalStyles.getBottomSafeArea(insets) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Toggle Switch */}
        <RidesTabToggle
          travelMode={travelMode}
          onModeChange={handleTravelModeChange}
        />

        {/* My Trips Quick Access */}
        <TouchableOpacity
          style={styles.myTripsCard}
          onPress={handleMyTrips}
          activeOpacity={0.8}>
          <View style={styles.myTripsContent}>
            <MaterialCommunityIcons name="history" size={24} color={colors.primary} />
            <View style={styles.myTripsTextContainer}>
              <Text style={styles.myTripsTitle}>Mis Viajes</Text>
              <Text style={styles.myTripsSubtitle}>Ver viajes creados y reservados</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
        </TouchableOpacity>

        {travelMode === 'search' ? (
          <>
            {/* Search Card */}
            <TripSearchCard
              origin={origin}
              setOrigin={setOrigin}
              destination={destination}
              setDestination={setDestination}
              onSearch={handleSearchTrips}
            />

            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="car-multiple" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Viajes Disponibles</Text>
              </View>
            </View>

            {/* Trip Cards List */}
            {loading && filteredTrips.length === 0 ? (
              <RidesSkeletonLoader />
            ) : filteredTrips.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="car-off" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No hay viajes disponibles</Text>
                <Text style={styles.emptySubtitle}>Intenta buscar con otros criterios o crea un nuevo viaje</Text>
                <TouchableOpacity
                  style={styles.createTripButton}
                  onPress={handleCreateFromSearch}
                  activeOpacity={0.8}>
                  <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                  <Text style={styles.createTripButtonText}>Crear Viaje</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tripsList}>
                {filteredTrips.map((trip: Trip, index: number) => (
                  <TripCard
                    key={trip.id}
                    trip={trip}
                    index={index}
                    onPress={handleTripPress}
                    onReserve={handleReserve}
                    currentUserId={profile?.id}
                  />
                ))}
              </View>
            )}
          </>
        ) : (
          /* OFFER TAB CONTENT */
          <>
            {/* Hero Card */}
            <OfferHeroCard onPublish={handleCreateTrip} />

            {/* My Active Routes Section */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="routes" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Mis Rutas Activas</Text>
              </View>
            </View>

            {/* Active Routes List */}
            {loadingMyTrips && filteredMyTrips.length === 0 ? (
              <RidesSkeletonLoader />
            ) : filteredMyTrips.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="map-marker-off" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No tienes rutas activas</Text>
                <Text style={styles.emptySubtitle}>Publica tu primera ruta y comienza a compartir viajes</Text>
              </View>
            ) : (
              <View style={styles.activeRoutesList}>
                {filteredMyTrips.map((trip: Trip) => (
                  <ActiveTripCard
                    key={trip.id}
                    trip={trip}
                    onPress={handleActiveTripPress}
                    onManage={handleManageTrip}
                    onEdit={handleEditTrip}
                  />
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F8F7', // background-light
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  myTripsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  myTripsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  myTripsTextContainer: {
    gap: 2,
  },
  myTripsTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  myTripsSubtitle: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    letterSpacing: -0.5,
  },
  tripsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  activeRoutesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    paddingVertical: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  createTripButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 24,
  },
  createTripButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },
});
