import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { RideStackParamList } from '../../../../navigation/types';
import { TripStatus, Trip, Rating, TripRequest } from '../../domain/entities/trip.entity';
import { useAuthStore } from '../../../../features/auth/presentation/store/auth.store';
import { useTripStore } from '../store/trip.store';
import { globalStyles, FONT_FAMILY } from '../../../../config/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RidesScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'RidesList'>;

type TravelMode = 'search' | 'offer';

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

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, []);

  // When switching modes or profile loads, fetch the appropriate trips
  useEffect(() => {
    if (!profile?.id) return;
    if (travelMode === 'offer') {
      fetchMyTrips(profile.id);
    } else {
      fetchTrips();
    }
  }, [travelMode, profile?.id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    const doRefresh = async () => {
      if (travelMode === 'offer' && profile?.id) {
        await fetchMyTrips(profile.id);
      } else {
        await fetchTrips();
      }
      setRefreshing(false);
    };
    doRefresh();
  }, [profile?.id, travelMode]);

  const normalize = (str: string) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const now = new Date();
  // Public trips: future only, exclude own trips
  const trips = allTrips
    .filter((t: Trip) => new Date(t.departureTime) > now)
    .filter((t: Trip) => !profile?.id || t.driverId !== profile.id);

  // Offer-mode trips: own future trips
  const myTrips = allMyTrips
    .filter((t: Trip) => t.driverId === profile?.id && new Date(t.departureTime) > now);

  const filteredTrips = trips.filter((trip: Trip) => {
    const originMatch = !origin || normalize(trip.origin).includes(normalize(origin));
    const destMatch = !destination || normalize(trip.destination).includes(normalize(destination));
    return originMatch && destMatch;
  });

  const loading = tripsLoading;
  const loadingMyTrips = myTripsLoading;

  const handleCreateTrip = () => {
    navigation.navigate('CreateTrip');
  };

  const handleSearchTrips = () => {
    fetchTrips();
  };

  const handleTripPress = (tripId: string) => {
    navigation.navigate('TripDetail', { tripId });
  };

  const handleMyTrips = () => {
    navigation.navigate('MyTrips');
  };

  const handleReserve = (tripId: string) => {
    navigation.navigate('TripDetail', { tripId });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatEstimatedArrival = (departureTime: string, durationMinutes: number = 45) => {
    const departure = new Date(departureTime);
    const arrival = new Date(departure.getTime() + durationMinutes * 60000);
    return arrival.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatCurrentDate = () => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    };
    const formatted = today.toLocaleDateString('es-ES', options);
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const getSeatsInfo = (availableSeats: number, status: TripStatus) => {
    if (status === 'FULL' || availableSeats === 0) {
      return { text: '0 disponibles', isLow: false, isFull: true };
    }
    if (availableSeats === 1) {
      return { text: '1 asiento', isLow: true, isFull: false };
    }
    return { text: `${availableSeats} disponibles`, isLow: false, isFull: false };
  };

  const getDriverRating = (trip: Trip) => {
    if (trip.driver.averageRating) {
      return trip.driver.averageRating.toFixed(1);
    }
    // Calculate from ratings if available
    if (trip.ratings && trip.ratings.length > 0) {
      const avg = trip.ratings.reduce((acc: number, r: Rating) => acc + r.rating, 0) / trip.ratings.length;
      return avg.toFixed(1);
    }
    return '5.0';
  };

  const renderTripCard = (trip: Trip, index: number) => {
    const seatsInfo = getSeatsInfo(trip.availableSeats, trip.status);
    const isFull = seatsInfo.isFull;
    const rating = getDriverRating(trip);

    return (
      <TouchableOpacity
        key={trip.id}
        style={[styles.tripCard, isFull && styles.tripCardFull]}
        onPress={() => !isFull && handleTripPress(trip.id)}
        activeOpacity={isFull ? 1 : 0.7}
        disabled={isFull}>

        {/* Full overlay */}
        {isFull && (
          <View style={styles.fullOverlay}>
            <View style={styles.fullBadge}>
              <Text style={styles.fullBadgeText}>Lleno</Text>
            </View>
          </View>
        )}

        {/* Header: Driver info + Price */}
        <View style={styles.tripCardHeader}>
          <View style={styles.driverInfo}>
            <View style={styles.avatarContainer}>
              <View style={[styles.avatarWrapper, isFull && styles.avatarWrapperFull]}>
                {trip.driver.avatarUrl ? (
                  <Image
                    source={{ uri: trip.driver.avatarUrl }}
                    style={[styles.driverAvatar, isFull && styles.avatarGrayscale]}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialCommunityIcons name="account" size={24} color="#666" />
                  </View>
                )}
              </View>
              {/* Rating badge */}
              <View style={styles.ratingBadge}>
                <MaterialCommunityIcons name="star" size={10} color={colors.white} />
                <Text style={styles.ratingText}>{rating}</Text>
              </View>
            </View>
            <View style={styles.driverDetails}>
              <Text style={[styles.driverName, isFull && styles.textMuted]}>
                {trip.driver.name}
              </Text>
              <Text style={styles.driverCareer}>{trip.driver.career || 'Estudiante'}</Text>
            </View>
          </View>

          <View style={[
            styles.priceBadge,
            isFull && styles.priceBadgeFull,
            { transform: [{ rotate: index % 2 === 0 ? '-2deg' : '1deg' }] }
          ]}>
            <Text style={[styles.priceText, isFull && styles.priceTextFull]}>
              ${trip.price?.toFixed(2) || '0.00'}
            </Text>
          </View>
        </View>

        {/* Route Timeline */}
        <View style={[styles.routeTimeline, isFull && styles.routeTimelineFull]}>
          <View style={styles.timeColumn}>
            <Text style={[styles.timeText, styles.timeBold, isFull && styles.textMuted]}>
              {formatTime(trip.departureTime)}
            </Text>
            <View style={styles.timeConnector} />
            <Text style={[styles.timeText, isFull && styles.textMuted]}>
              {formatEstimatedArrival(trip.departureTime)}
            </Text>
          </View>

          <View style={[styles.routeContainer, isFull && styles.routeContainerFull]}>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, styles.routeDotOrigin, isFull && styles.routeDotFull]} />
              <Text style={[styles.routeText, isFull && styles.textMuted]} numberOfLines={1}>
                {trip.origin}
              </Text>
            </View>
            <View style={styles.routeItem}>
              <View style={[styles.routeDot, styles.routeDotDestination, isFull && styles.routeDotFull]} />
              <Text style={[styles.routeText, isFull && styles.textMuted]} numberOfLines={1}>
                {trip.destination}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer: Seats + Reserve button */}
        <View style={styles.tripCardFooter}>
          <View style={styles.seatsInfo}>
            <MaterialCommunityIcons
              name={isFull ? 'seat' : seatsInfo.isLow ? 'seat-recline-extra' : 'seat-recline-normal'}
              size={18}
              color={isFull ? '#9CA3AF' : seatsInfo.isLow ? '#EF4444' : '#6B7280'}
            />
            <Text style={[
              styles.seatsText,
              seatsInfo.isLow && !isFull && styles.seatsTextLow
            ]}>
              {seatsInfo.text}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.reserveButton, isFull && styles.reserveButtonDisabled]}
            onPress={() => !isFull && handleReserve(trip.id)}
            disabled={isFull}
            activeOpacity={0.8}>
            <Text style={[styles.reserveButtonText, isFull && styles.reserveButtonTextDisabled]}>
              {isFull ? 'Agotado' : 'Reservar'}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viajes Compartidos</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: globalStyles.getBottomSafeArea(insets) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        {/* Toggle Switch */}
        <View style={styles.toggleContainer}>
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              style={[styles.toggleOption, travelMode === 'search' && styles.toggleOptionActive]}
              onPress={() => setTravelMode('search')}
              activeOpacity={0.8}>
              <Text style={[
                styles.toggleText,
                travelMode === 'search' && styles.toggleTextActive
              ]}>
                Busco Viaje
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleOption, travelMode === 'offer' && styles.toggleOptionActive]}
              onPress={() => setTravelMode('offer')}
              activeOpacity={0.8}>
              <Text style={[
                styles.toggleText,
                travelMode === 'offer' && styles.toggleTextActive
              ]}>
                Ofrezco Viaje
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {travelMode === 'search' ? (
          <>
            {/* Search Card */}
            <View style={styles.searchCard}>
              {/* Decorative blob */}
              <View style={styles.decorativeBlob} />

              <View style={styles.searchCardContent}>
                {/* Origin Input */}
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="circle-outline" size={20} color={colors.primary} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Origen (ej. Universidad)"
                    placeholderTextColor="#9CA3AF"
                    value={origin}
                    onChangeText={setOrigin}
                  />
                </View>

                {/* Connector dots */}
                <View style={styles.inputConnector} />

                {/* Destination Input */}
                <View style={styles.inputContainer}>
                  <MaterialCommunityIcons name="map-marker" size={20} color={colors.accent} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Destino (ej. Centro)"
                    placeholderTextColor="#9CA3AF"
                    value={destination}
                    onChangeText={setDestination}
                  />
                </View>

                {/* Search Button */}
                <TouchableOpacity
                  style={styles.searchButton}
                  onPress={handleSearchTrips}
                  activeOpacity={0.8}>
                  <MaterialCommunityIcons name="magnify" size={20} color={colors.white} />
                  <Text style={styles.searchButtonText}>Buscar Ruta</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section Title */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="car-multiple" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Viajes Disponibles</Text>
              </View>
              <View style={styles.dateBadge}>
                <Text style={styles.dateBadgeText}>{formatCurrentDate()}</Text>
              </View>
            </View>

            {/* Trip Cards List */}
            {loading && trips.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : trips.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="car-off" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No hay viajes disponibles</Text>
                <Text style={styles.emptySubtitle}>Intenta buscar con otros criterios o crea un nuevo viaje</Text>
                <TouchableOpacity
                  style={styles.createTripButton}
                  onPress={handleCreateTrip}
                  activeOpacity={0.8}>
                  <MaterialCommunityIcons name="plus" size={20} color={colors.white} />
                  <Text style={styles.createTripButtonText}>Crear Viaje</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.tripsList}>
                {filteredTrips.map((trip: Trip, index: number) => renderTripCard(trip, index))}
              </View>
            )}

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
          </>
        ) : (
          /* OFFER TAB CONTENT */
          <>
            {/* Hero Card */}
            <View style={styles.offerHeroCard}>
              {/* Decorative blobs */}
              <View style={styles.heroBlob1} />
              <View style={styles.heroBlob2} />
              <View style={styles.heroBlob3} />

              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>¿A dónde vas hoy?</Text>
                <Text style={styles.heroSubtitle}>Comparte tu ruta y reduce costos.</Text>

                <TouchableOpacity
                  style={styles.publishButton}
                  onPress={handleCreateTrip}
                  activeOpacity={0.9}>
                  <MaterialCommunityIcons name="plus-circle" size={28} color={colors.primary} />
                  <Text style={styles.publishButtonText}>Publicar Nueva Ruta</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* My Active Routes Section */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <MaterialCommunityIcons name="routes" size={22} color={colors.primary} />
                <Text style={styles.sectionTitle}>Mis Rutas Activas</Text>
              </View>
            </View>

            {/* Active Routes List */}
            {loadingMyTrips ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : myTrips.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="map-marker-off" size={64} color="#D1D5DB" />
                <Text style={styles.emptyTitle}>No tienes rutas activas</Text>
                <Text style={styles.emptySubtitle}>Publica tu primera ruta y comienza a compartir viajes</Text>
              </View>
            ) : (
              <View style={styles.activeRoutesList}>
                {myTrips.map((trip: Trip) => (
                  <TouchableOpacity
                    key={trip.id}
                    style={styles.activeRouteCard}
                    onPress={() => navigation.navigate('TripDetail', { tripId: trip.id })}
                    activeOpacity={0.8}>
                    {/* Header with time and status */}
                    <View style={styles.activeRouteHeader}>
                      <View style={styles.activeRouteTimeContainer}>
                        <Text style={styles.activeRouteTimeLabel}>
                          {(() => {
                            const tripDate = new Date(trip.departureTime);
                            const today = new Date();
                            const tomorrow = new Date();
                            tomorrow.setDate(today.getDate() + 1);

                            if (tripDate.toDateString() === today.toDateString()) return 'Hoy';
                            if (tripDate.toDateString() === tomorrow.toDateString()) return 'Mañana';

                            const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };
                            return tripDate.toLocaleDateString('es-ES', options);
                          })()}
                        </Text>
                        <View style={styles.activeRouteTime}>
                          <Text style={styles.activeRouteTimeValue}>{formatTime(trip.departureTime)}</Text>
                          <Text style={styles.activeRouteTimePeriod}>
                            {new Date(trip.departureTime).getHours() < 12 ? 'AM' : 'PM'}
                          </Text>
                        </View>
                      </View>

                      <View style={[
                        styles.activeRouteStatus,
                        (trip.requests?.filter((r: TripRequest) => r.status === 'ACCEPTED').length ?? 0) > 0
                          ? styles.activeRouteStatusConfirmed
                          : styles.activeRouteStatusPending
                      ]}>
                        {(trip.requests?.filter((r: TripRequest) => r.status === 'ACCEPTED').length ?? 0) > 0 ? (
                          <>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusTextConfirmed}>
                              {trip.requests?.filter((r: TripRequest) => r.status === 'ACCEPTED').length} Pasajeros confirmados
                            </Text>
                          </>
                        ) : (
                          <>
                            <MaterialCommunityIcons name="timer-sand" size={14} color="#D97706" />
                            <Text style={styles.statusTextPending}>Esperando solicitudes</Text>
                          </>
                        )}
                      </View>
                    </View>

                    {/* Route Timeline */}
                    <View style={styles.activeRouteTimeline}>
                      <View style={styles.activeRouteDotsColumn}>
                        <View style={[styles.activeRouteDot, styles.activeRouteDotOrigin]} />
                        <View style={styles.activeRouteLine} />
                        <View style={[styles.activeRouteDot, styles.activeRouteDotDest]} />
                      </View>
                      <View style={styles.activeRouteLocations}>
                        <View style={styles.activeRouteLocation}>
                          <Text style={styles.activeRouteLocationName}>{trip.origin}</Text>
                          <Text style={styles.activeRouteLocationLabel}>Punto de partida</Text>
                        </View>
                        <View style={styles.activeRouteLocation}>
                          <Text style={styles.activeRouteLocationName}>{trip.destination}</Text>
                          <Text style={styles.activeRouteLocationLabel}>Destino</Text>
                        </View>
                      </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.activeRouteFooter}>
                      <View style={styles.activeRoutePassengers}>
                        {(() => {
                          const acceptedRequests = trip.requests?.filter((r: TripRequest) => r.status === 'ACCEPTED') ?? [];
                          if (acceptedRequests.length > 0) {
                            return (
                              <>
                                <View style={styles.passengerAvatars}>
                                  {acceptedRequests.slice(0, 3).map((request: TripRequest, idx: number) => (
                                    <Image
                                      key={request.id}
                                      source={{ uri: request.passenger.avatarUrl || 'https://via.placeholder.com/32' }}
                                      style={[styles.passengerAvatar, { marginLeft: idx > 0 ? -8 : 0 }]}
                                    />
                                  ))}
                                </View>
                                <Text style={styles.passengerCount}>
                                  {trip.availableSeats === 0 ? 'Cupo lleno' : `${trip.availableSeats} libres`}
                                </Text>
                              </>
                            );
                          } else {
                            return (
                              <>
                                <MaterialCommunityIcons name="seat-recline-normal" size={18} color="#9CA3AF" />
                                <Text style={styles.seatsAvailable}>{trip.availableSeats} asientos libres</Text>
                              </>
                            );
                          }
                        })()}
                      </View>
                      {(trip.requests?.filter((r: TripRequest) => r.status === 'ACCEPTED').length ?? 0) > 0 ? (
                        <TouchableOpacity
                          onPress={() => navigation.navigate('ManageTripRequests', { tripId: trip.id })}>
                          <Text style={styles.manageText}>Gestionar</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          onPress={() => navigation.navigate('EditTrip', { tripId: trip.id })}>
                          <Text style={styles.manageText}>Editar</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
  },
  headerBackButton: {
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
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Toggle
  toggleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  toggleWrapper: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 28,
    padding: 6,
    maxWidth: 320,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  toggleOption: {
    flex: 1,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#9CA3AF',
  },
  toggleTextActive: {
    color: colors.white,
  },

  // Search Card
  searchCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 20,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
    borderWidth: 1,
    borderColor: `${colors.primary}1A`,
    overflow: 'hidden',
  },
  decorativeBlob: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: `${colors.primary}0D`,
  },
  searchCardContent: {
    gap: 16,
    zIndex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F8F7',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  inputConnector: {
    position: 'absolute',
    left: 25,
    top: 46,
    width: 2,
    height: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: colors.primaryDark,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 48,
    gap: 8,
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  dateBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dateBadgeText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },

  // Trip Cards
  tripsList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  tripCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'hidden',
  },
  tripCardFull: {
    opacity: 0.8,
  },
  fullOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249, 250, 251, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  fullBadge: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fullBadgeText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },

  // Trip Card Header
  tripCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.accent,
    padding: 2,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  avatarWrapperFull: {
    borderColor: '#9CA3AF',
  },
  driverAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  avatarGrayscale: {
    opacity: 0.5,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.white,
    gap: 2,
  },
  ratingText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },
  driverDetails: {
    gap: 2,
  },
  driverName: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  driverCareer: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
  },
  priceBadge: {
    backgroundColor: colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  priceBadgeFull: {
    backgroundColor: '#E5E7EB',
  },
  priceText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  priceTextFull: {
    color: '#9CA3AF',
  },

  // Route Timeline
  routeTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingLeft: 8,
  },
  routeTimelineFull: {
    opacity: 0.5,
  },
  timeColumn: {
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  timeBold: {
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  timeConnector: {
    width: 2,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 1,
  },
  routeContainer: {
    flex: 1,
    backgroundColor: '#F6F8F7',
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  routeContainerFull: {
    backgroundColor: '#F9FAFB',
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeDotOrigin: {
    backgroundColor: colors.primary,
  },
  routeDotDestination: {
    backgroundColor: colors.accent,
  },
  routeDotFull: {
    backgroundColor: '#9CA3AF',
  },
  routeText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: colors.primaryDark,
    flex: 1,
  },
  textMuted: {
    color: '#9CA3AF',
  },

  // Trip Card Footer
  tripCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  seatsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  seatsText: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  seatsTextLow: {
    color: '#EF4444',
  },
  reserveButton: {
    backgroundColor: `${colors.primary}1A`,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  reserveButtonDisabled: {
    backgroundColor: '#F3F4F6',
  },
  reserveButtonText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  reserveButtonTextDisabled: {
    color: '#9CA3AF',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },

  // Loading & Empty states
  loadingContainer: {
    paddingVertical: 60,
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
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
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

  // My Trips Card
  myTripsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: `${colors.primary}20`,
    borderStyle: 'dashed',
  },
  myTripsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
  },

  // Offer Tab - Hero Card
  offerHeroCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  heroBlob1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroBlob2: {
    position: 'absolute',
    top: 80,
    left: -40,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(247,182,52,0.2)',
  },
  heroBlob3: {
    position: 'absolute',
    bottom: -20,
    right: 40,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(247,182,52,0.1)',
  },
  heroContent: {
    zIndex: 10,
    gap: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.white,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  publishButtonText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },

  // Active Routes List
  activeRoutesList: {
    paddingHorizontal: 16,
    gap: 16,
  },
  activeRouteCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  activeRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  activeRouteTimeContainer: {
    gap: 2,
  },
  activeRouteTimeLabel: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activeRouteTime: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  activeRouteTimeValue: {
    fontSize: 24,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  activeRouteTimePeriod: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  activeRouteStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  activeRouteStatusConfirmed: {
    backgroundColor: '#D1FAE5',
  },
  activeRouteStatusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22C55E',
  },
  statusTextConfirmed: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  statusTextPending: {
    fontSize: 11,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#D97706',
  },
  activeRouteTimeline: {
    flexDirection: 'row',
    gap: 16,
  },
  activeRouteDotsColumn: {
    alignItems: 'center',
    paddingTop: 8,
    width: 16,
  },
  activeRouteDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  activeRouteDotOrigin: {
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: `${colors.primary}30`,
  },
  activeRouteDotDest: {
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: `${colors.accent}30`,
  },
  activeRouteLine: {
    width: 2,
    flex: 1,
    marginVertical: 4,
    backgroundColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  activeRouteLocations: {
    flex: 1,
    gap: 24,
  },
  activeRouteLocation: {
    gap: 2,
  },
  activeRouteLocationName: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  activeRouteLocationLabel: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#9CA3AF',
  },
  activeRouteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F9FAFB',
  },
  activeRoutePassengers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passengerAvatars: {
    flexDirection: 'row',
  },
  passengerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.white,
  },
  passengerCount: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  seatsAvailable: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  manageText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
});
