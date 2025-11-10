import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, SafeAreaView, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RidesHeader } from '../../components/rides/RidesHeader';
import { RideCard, Ride } from '../../components/rides/RideCard';
import { FloatingActionButton } from '../../components/rides/FloatingActionButton';
import { tripService, Trip } from '../../services/trip.service';
import { authService } from '../../services/auth.service';
import { colors } from '../../config/colors';
import { RideStackParamList } from '../../navigation/types';
import { globalStyles } from '../../config/globalStyles';

type RidesScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'RidesList'>;

export const RidesScreen = () => {
  const navigation = useNavigation<RidesScreenNavigationProp>();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<{
    origin?: string;
    destination?: string;
    date?: string;
  }>({});

  useEffect(() => {
    fetchTrips();
  }, [filters]);

  const fetchTrips = async (pageNum = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      }
      const response = await tripService.getTrips({
        ...filters,
        page: pageNum,
        limit: 20,
      });
      
      if (reset) {
        setTrips(response.data.trips);
      } else {
        setTrips(prev => [...prev, ...response.data.trips]);
      }
      
      setHasMore(pageNum < response.data.pagination.pages);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Error fetching trips:', error);
      Alert.alert('Error', 'No se pudieron cargar los viajes. Intenta nuevamente.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchTrips(1, true);
  }, [filters]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchTrips(page + 1);
    }
  };

  const handleJoinRide = async (rideId: string) => {
    try {
      const user = await authService.getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para unirte a un viaje');
        return;
      }

      Alert.alert(
        'Unirse al viaje',
        '¿Estás seguro de que deseas unirte a este viaje?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Confirmar',
            onPress: async () => {
              try {
                await tripService.joinTrip(rideId);
                Alert.alert('Éxito', 'Solicitud enviada. El conductor te notificará cuando la acepte.');
                onRefresh();
              } catch (error: any) {
                Alert.alert(
                  'Error',
                  error.response?.data?.message || 'No se pudo unir al viaje. Intenta nuevamente.'
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error joining trip:', error);
    }
  };

  const handleFilterPress = () => {
    // TODO: Implementar modal de filtros
    console.log('Abrir filtros');
  };

  const handleOfferRide = () => {
    navigation.navigate('CreateTrip');
  };

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
        <RidesHeader onFilterPress={handleFilterPress} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando viajes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <RidesHeader onFilterPress={handleFilterPress} />
      
      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay viajes disponibles</Text>
          <Text style={styles.emptySubtext}>
            {Object.keys(filters).length > 0
              ? 'Intenta ajustar los filtros'
              : 'Sé el primero en ofrecer un viaje'}
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
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const paddingToBottom = 20;
            if (
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - paddingToBottom
            ) {
              loadMore();
            }
          }}
          scrollEventThrottle={400}
        >
          {trips.map((trip) => (
            <RideCard
              key={trip.id}
              ride={convertTripToRide(trip)}
              onJoinPress={() => handleTripPress(trip.id)}
            />
          ))}
          {loading && hasMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </ScrollView>
      )}

      <FloatingActionButton
        label="Ofrecer Viaje"
        icon="road-variant"
        onPress={handleOfferRide}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 50,
    paddingTop: globalStyles.screenHeight * 0.06,
  },
  scrollView: {
    flex: 1,
    paddingBottom: 100,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120, // Espacio para el botón flotante
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
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
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
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

