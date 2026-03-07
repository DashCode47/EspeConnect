import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Trip, TripType } from '../../domain/entities/trip.entity';
import { TripRepositoryImpl } from '../../data/repositories/trip.repository.impl';
import { useAuthStore } from '../../../../features/auth/presentation/store/auth.store';
import { RideCard, Ride } from '../../../../components/rides/RideCard';
import { colors } from '../../../../config/colors';
import { RideStackParamList } from '../../../../navigation/types';
import { useHideNavbar } from '../../../../hooks/useHideNavbar';
import { ErrorModal } from '../../../../components/modals/ErrorModal';

type MyTripsScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'MyTrips'>;

const repository = new TripRepositoryImpl();

export const MyTripsScreen = () => {
  const navigation = useNavigation<MyTripsScreenNavigationProp>();
  const { user: profile } = useAuthStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tripType, setTripType] = useState<TripType>('created'); // Por defecto mostrar solo creados
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useHideNavbar(true);

  useEffect(() => {
    if (!profile) {
      setErrorMessage('Debes iniciar sesión para ver tus viajes');
      setShowErrorModal(true);
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } else {
      fetchTrips();
    }
  }, [profile?.id, tripType]);

  const fetchTrips = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);
      const result = await repository.getUserTrips(profile.id, {
        type: tripType,
      });
      if (result.isRight()) {
        setTrips(result.value);
      } else {
        setErrorMessage(result.value.message);
        setShowErrorModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching trips:', error);
      setErrorMessage('Error al cargar tus viajes');
      setShowErrorModal(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleTripPress = (tripId: string) => {
    navigation.navigate('TripDetail', { tripId });
  };

  const handleManageRequests = (tripId: string) => {
    navigation.navigate('ManageTripRequests', { tripId });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, [profile?.id, tripType]);

  // Convert Trip to Ride format for RideCard component
  const convertTripToRide = (trip: Trip): Ride => {
    const departureDate = new Date(trip.departureTime);
    const timeString = departureDate.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return {
      id: trip.id,
      driver: {
        id: trip.driver.id,
        name: trip.driver.name,
        avatarUrl: trip.driver.avatarUrl || undefined,
        isVerified: trip.driver.averageRating ? trip.driver.averageRating >= 4 : false,
        role: trip.driver.averageRating
          ? `Conductor verificado (${trip.driver.averageRating.toFixed(1)}⭐)`
          : 'Estudiante',
      },
      route: {
        from: trip.origin,
        to: trip.destination,
      },
      schedule: {
        departureTime: `${timeString}h`,
      },
      seats: {
        available: trip.availableSeats,
      },
      price: {
        type: trip.price ? 'fixed' : 'voluntary',
        amount: trip.price || undefined,
      },
    };
  };

  if (loading && trips.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mis Viajes</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando viajes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Viajes</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.filterContainer}>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, tripType === 'created' && styles.filterButtonActive]}
            onPress={() => setTripType('created')}
            activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="car"
              size={20}
              color={tripType === 'created' ? colors.white : colors.primaryDark}
            />
            <Text
              style={[
                styles.filterButtonText,
                tripType === 'created' && styles.filterButtonTextActive,
              ]}>
              Creados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, tripType === 'joined' && styles.filterButtonActive]}
            onPress={() => setTripType('joined')}
            activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="account-plus"
              size={20}
              color={tripType === 'joined' ? colors.white : colors.primaryDark}
            />
            <Text
              style={[
                styles.filterButtonText,
                tripType === 'joined' && styles.filterButtonTextActive,
              ]}>
              Unidos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, tripType === 'all' && styles.filterButtonActive]}
            onPress={() => setTripType('all')}
            activeOpacity={0.7}>
            <MaterialCommunityIcons
              name="format-list-bulleted"
              size={20}
              color={tripType === 'all' ? colors.white : colors.primaryDark}
            />
            <Text
              style={[styles.filterButtonText, tripType === 'all' && styles.filterButtonTextActive]}>
              Todos
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="road-variant" size={64} color="#CCC" />
          <Text style={styles.emptyText}>No hay viajes</Text>
          <Text style={styles.emptySubtext}>
            {tripType === 'created'
              ? 'Aún no has creado ningún viaje'
              : tripType === 'joined'
                ? 'Aún no te has unido a ningún viaje'
                : 'No tienes viajes registrados'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {trips.map((trip) => (
            <View key={trip.id} style={styles.tripCardContainer}>
              <View style={styles.tripBadge}>
                <Chip
                  icon={() => (
                    <MaterialCommunityIcons
                      name={trip.userRole === 'driver' ? 'car' : 'account'}
                      size={16}
                      color={colors.white}
                    />
                  )}
                  style={[
                    styles.roleChip,
                    {
                      backgroundColor:
                        trip.userRole === 'driver' ? colors.primary : colors.secondary,
                    },
                  ]}
                  textStyle={styles.roleChipText}
                >
                  {trip.userRole === 'driver' ? 'Conductor' : 'Pasajero'}
                </Chip>
                <Chip
                  icon={() => (
                    <MaterialCommunityIcons
                      name={
                        trip.status === 'ACTIVE'
                          ? 'check-circle'
                          : trip.status === 'FULL'
                            ? 'account-group'
                            : 'cancel'
                      }
                      size={16}
                      color={colors.white}
                    />
                  )}
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor:
                        trip.status === 'ACTIVE'
                          ? '#4CAF50'
                          : trip.status === 'FULL'
                            ? '#FF9800'
                            : '#F44336',
                    },
                  ]}
                  textStyle={styles.statusChipText}
                >
                  {trip.status === 'ACTIVE'
                    ? 'Activo'
                    : trip.status === 'FULL'
                      ? 'Completo'
                      : 'Cancelado'}
                </Chip>
              </View>
              <TouchableOpacity
                onPress={() => handleTripPress(trip.id)}
                activeOpacity={0.7}>
                <RideCard
                  ride={convertTripToRide(trip)}
                  onJoinPress={trip.userRole !== 'driver' ? () => handleTripPress(trip.id) : undefined}
                />
              </TouchableOpacity>
              {trip.userRole === 'driver' && trip.status === 'ACTIVE' && (
                <TouchableOpacity
                  style={styles.manageButton}
                  onPress={() => handleManageRequests(trip.id)}
                  activeOpacity={0.7}>
                  <MaterialCommunityIcons name="account-group" size={18} color={colors.primary} />
                  <Text style={styles.manageButtonText}>Gestionar Solicitudes</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Error Modal */}
      <ErrorModal
        visible={showErrorModal}
        message={errorMessage}
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 70,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  manageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  tripCardContainer: {
    marginBottom: 16,
  },
  tripBadge: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  roleChip: {
    paddingHorizontal: 8,
  },
  roleChipText: {
    color: colors.white,
    fontSize: 12,
  },
  statusChip: {
    paddingHorizontal: 8,
  },
  statusChipText: {
    color: colors.white,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

