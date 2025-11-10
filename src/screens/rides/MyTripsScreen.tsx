import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, SegmentedButtons, Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { tripService, Trip, TripType } from '../../services/trip.service';
import { authService } from '../../services/auth.service';
import { RideCard, Ride } from '../../components/rides/RideCard';
import { colors } from '../../config/colors';
import { RideStackParamList } from '../../navigation/types';

type MyTripsScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'MyTrips'>;

export const MyTripsScreen = () => {
  const navigation = useNavigation<MyTripsScreenNavigationProp>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tripType, setTripType] = useState<TripType>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      fetchTrips();
    }
  }, [currentUserId, tripType]);

  const fetchCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user?.id) {
        setCurrentUserId(user.id);
      } else {
        Alert.alert('Error', 'Debes iniciar sesión para ver tus viajes');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchTrips = async () => {
    if (!currentUserId) return;

    try {
      setLoading(true);
      const response = await tripService.getUserTrips(currentUserId, {
        type: tripType,
      });
      setTrips(response.data.trips);
    } catch (error: any) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, [currentUserId, tripType]);

  const handleTripPress = (tripId: string) => {
    navigation.navigate('TripDetail', { tripId });
  };

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
        <SegmentedButtons
          value={tripType}
          onValueChange={(value) => setTripType(value as TripType)}
          buttons={[
            {
              value: 'all',
              label: 'Todos',
              icon: 'format-list-bulleted',
            },
            {
              value: 'created',
              label: 'Creados',
              icon: 'car',
            },
            {
              value: 'joined',
              label: 'Unidos',
              icon: 'account-plus',
            },
          ]}
        />
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
              <RideCard
                ride={convertTripToRide(trip)}
                onJoinPress={() => handleTripPress(trip.id)}
              />
            </View>
          ))}
        </ScrollView>
      )}
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

