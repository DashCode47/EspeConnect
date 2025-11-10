import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Text, Avatar, Chip, Button, Divider } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { tripService, Trip, TripRequest } from '../../services/trip.service';
import { authService } from '../../services/auth.service';
import { colors } from '../../config/colors';
import { RideStackParamList } from '../../navigation/types';

type TripDetailScreenRouteProp = RouteProp<RideStackParamList, 'TripDetail'>;
type TripDetailScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'TripDetail'>;

export const TripDetailScreen = () => {
  const route = useRoute<TripDetailScreenRouteProp>();
  const navigation = useNavigation<TripDetailScreenNavigationProp>();
  const { tripId } = route.params;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTrip();
    fetchCurrentUser();
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTripById(tripId);
      setTrip(response.data.trip);
    } catch (error: any) {
      console.error('Error fetching trip:', error);
      Alert.alert('Error', 'No se pudo cargar el viaje');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const handleJoinTrip = async () => {
    if (!trip || !currentUser) {
      Alert.alert('Error', 'Debes iniciar sesión para unirte a un viaje');
      return;
    }

    if (trip.driverId === currentUser.id) {
      Alert.alert('Error', 'No puedes unirte a tu propio viaje');
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
              setActionLoading(true);
              await tripService.joinTrip(tripId);
              Alert.alert('Éxito', 'Solicitud enviada. El conductor te notificará cuando la acepte.');
              fetchTrip();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo unir al viaje. Intenta nuevamente.'
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirmPassenger = async (requestId: string) => {
    if (!trip || trip.driverId !== currentUser?.id) {
      Alert.alert('Error', 'Solo el conductor puede confirmar pasajeros');
      return;
    }

    Alert.alert(
      'Confirmar pasajero',
      '¿Aceptar a este pasajero en el viaje?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              setActionLoading(true);
              await tripService.confirmPassenger(tripId, { requestId });
              Alert.alert('Éxito', 'Pasajero confirmado exitosamente');
              fetchTrip();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo confirmar al pasajero.'
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleEditTrip = () => {
    if (trip) {
      navigation.navigate('EditTrip', { tripId: trip.id });
    }
  };

  const handleCancelTrip = () => {
    Alert.alert(
      'Cancelar viaje',
      '¿Estás seguro de que deseas cancelar este viaje? Todos los pasajeros serán notificados.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(true);
              await tripService.cancelTrip(tripId);
              Alert.alert('Éxito', 'Viaje cancelado exitosamente');
              navigation.goBack();
            } catch (error: any) {
              Alert.alert(
                'Error',
                error.response?.data?.message || 'No se pudo cancelar el viaje.'
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleRateDriver = () => {
    navigation.navigate('RateDriver', { tripId });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isDriver = trip?.driverId === currentUser?.id;
  const hasJoined = trip?.requests?.some(
    (req) => req.passengerId === currentUser?.id && req.status === 'ACCEPTED'
  );
  const hasPendingRequest = trip?.requests?.some(
    (req) => req.passengerId === currentUser?.id && req.status === 'PENDING'
  );
  const canJoin = !isDriver && !hasJoined && !hasPendingRequest && trip?.status === 'ACTIVE';
  const canRate = hasJoined && trip?.status !== 'ACTIVE' && !trip?.ratings?.some(
    (rating) => rating.raterId === currentUser?.id
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando viaje...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Viaje no encontrado</Text>
          <Button onPress={() => navigation.goBack()}>Volver</Button>
        </View>
      </SafeAreaView>
    );
  }

  const pendingRequests = trip.requests?.filter((req) => req.status === 'PENDING') || [];
  const acceptedRequests = trip.requests?.filter((req) => req.status === 'ACCEPTED') || [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del Viaje</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Status Chip */}
        <View style={styles.statusContainer}>
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

        {/* Driver Info */}
        <View style={styles.card}>
          <View style={styles.driverHeader}>
            {trip.driver.avatarUrl ? (
              <Avatar.Image size={64} source={{ uri: trip.driver.avatarUrl }} />
            ) : (
              <Avatar.Text
                size={64}
                label={trip.driver.name.charAt(0).toUpperCase()}
                style={styles.avatar}
              />
            )}
            <View style={styles.driverInfo}>
              <Text style={styles.driverName}>{trip.driver.name}</Text>
              <Text style={styles.driverCareer}>{trip.driver.career}</Text>
              {trip.driver.averageRating && (
                <View style={styles.ratingContainer}>
                  <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {trip.driver.averageRating.toFixed(1)} ({trip.driver.totalRatings} calificaciones)
                  </Text>
                </View>
              )}
            </View>
          </View>
          {trip.driver.bio && (
            <Text style={styles.bio}>{trip.driver.bio}</Text>
          )}
        </View>

        {/* Route Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Ruta</Text>
          <View style={styles.routeItem}>
            <MaterialCommunityIcons name="map-marker" size={24} color={colors.primary} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Origen</Text>
              <Text style={styles.routeValue}>{trip.origin}</Text>
            </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.routeItem}>
            <MaterialCommunityIcons name="map-marker-check" size={24} color={colors.secondary} />
            <View style={styles.routeTextContainer}>
              <Text style={styles.routeLabel}>Destino</Text>
              <Text style={styles.routeValue}>{trip.destination}</Text>
            </View>
          </View>
        </View>

        {/* Schedule Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Horario</Text>
          <View style={styles.scheduleItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
            <View style={styles.scheduleTextContainer}>
              <Text style={styles.scheduleLabel}>Fecha y hora de salida</Text>
              <Text style={styles.scheduleValue}>{formatDateTime(trip.departureTime)}</Text>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Detalles</Text>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="seat" size={20} color={colors.primary} />
            <Text style={styles.detailText}>
              {trip.availableSeats} {trip.availableSeats === 1 ? 'asiento disponible' : 'asientos disponibles'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons
              name={trip.price ? 'cash' : 'heart'}
              size={20}
              color={colors.primary}
            />
            <Text style={styles.detailText}>
              {trip.price ? `$${trip.price.toFixed(2)}` : 'Aporte voluntario'}
            </Text>
          </View>
          {trip.notes && (
            <View style={styles.notesContainer}>
              <Text style={styles.notesLabel}>Notas:</Text>
              <Text style={styles.notesText}>{trip.notes}</Text>
            </View>
          )}
        </View>

        {/* Passengers Section - Only for driver */}
        {isDriver && (
          <>
            {pendingRequests.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Solicitudes Pendientes</Text>
                {pendingRequests.map((request) => (
                  <View key={request.id} style={styles.requestItem}>
                    <View style={styles.requestHeader}>
                      {request.passenger.avatarUrl ? (
                        <Avatar.Image
                          size={40}
                          source={{ uri: request.passenger.avatarUrl }}
                        />
                      ) : (
                        <Avatar.Text
                          size={40}
                          label={request.passenger.name.charAt(0).toUpperCase()}
                        />
                      )}
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestName}>{request.passenger.name}</Text>
                        {request.passenger.career && (
                          <Text style={styles.requestCareer}>{request.passenger.career}</Text>
                        )}
                      </View>
                    </View>
                    <Button
                      mode="contained"
                      onPress={() => handleConfirmPassenger(request.id)}
                      disabled={actionLoading || trip.availableSeats === 0}
                      style={styles.confirmButton}
                    >
                      Aceptar
                    </Button>
                  </View>
                ))}
              </View>
            )}

            {acceptedRequests.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Pasajeros Confirmados</Text>
                {acceptedRequests.map((request) => (
                  <View key={request.id} style={styles.passengerItem}>
                    {request.passenger.avatarUrl ? (
                      <Avatar.Image
                        size={40}
                        source={{ uri: request.passenger.avatarUrl }}
                      />
                    ) : (
                      <Avatar.Text
                        size={40}
                        label={request.passenger.name.charAt(0).toUpperCase()}
                      />
                    )}
                    <View style={styles.passengerInfo}>
                      <Text style={styles.passengerName}>{request.passenger.name}</Text>
                      {request.passenger.career && (
                        <Text style={styles.passengerCareer}>{request.passenger.career}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Ratings Section */}
        {trip.ratings && trip.ratings.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Calificaciones</Text>
            {trip.ratings.map((rating) => (
              <View key={rating.id} style={styles.ratingItem}>
                <View style={styles.ratingHeader}>
                  {rating.rater.avatarUrl ? (
                    <Avatar.Image size={32} source={{ uri: rating.rater.avatarUrl }} />
                  ) : (
                    <Avatar.Text
                      size={32}
                      label={rating.rater.name.charAt(0).toUpperCase()}
                    />
                  )}
                  <View style={styles.ratingInfo}>
                    <Text style={styles.ratingName}>{rating.rater.name}</Text>
                    <View style={styles.ratingStars}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <MaterialCommunityIcons
                          key={star}
                          name={star <= rating.rating ? 'star' : 'star-outline'}
                          size={16}
                          color="#FFD700"
                        />
                      ))}
                    </View>
                  </View>
                </View>
                {rating.comment && (
                  <Text style={styles.ratingComment}>{rating.comment}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {isDriver && trip.status === 'ACTIVE' && (
            <>
              <Button
                mode="outlined"
                onPress={handleEditTrip}
                style={styles.actionButton}
                icon="pencil"
              >
                Editar Viaje
              </Button>
              <Button
                mode="outlined"
                onPress={handleCancelTrip}
                style={[styles.actionButton, styles.cancelButton]}
                icon="cancel"
                disabled={actionLoading}
              >
                Cancelar Viaje
              </Button>
            </>
          )}
          {canJoin && (
            <Button
              mode="contained"
              onPress={handleJoinTrip}
              style={styles.joinButton}
              icon="account-plus"
              disabled={actionLoading}
            >
              Unirse al Viaje
            </Button>
          )}
          {hasPendingRequest && (
            <Chip icon="clock-outline" style={styles.pendingChip}>
              Solicitud pendiente
            </Chip>
          )}
          {canRate && (
            <Button
              mode="contained"
              onPress={handleRateDriver}
              style={styles.rateButton}
              icon="star"
            >
              Calificar Conductor
            </Button>
          )}
        </View>
      </ScrollView>
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: colors.black,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  statusContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  statusChip: {
    paddingHorizontal: 12,
  },
  statusChipText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  driverInfo: {
    marginLeft: 12,
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  driverCareer: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bio: {
    fontSize: 14,
    color: colors.black,
    marginTop: 8,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: colors.primary,
    marginLeft: 12,
    marginBottom: 12,
  },
  routeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  routeValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scheduleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  scheduleValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.black,
    marginLeft: 12,
  },
  notesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#666',
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  requestCareer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  confirmButton: {
    marginLeft: 12,
  },
  passengerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  passengerInfo: {
    marginLeft: 12,
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
  },
  passengerCareer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  ratingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  ratingName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 4,
  },
  ratingStars: {
    flexDirection: 'row',
  },
  ratingComment: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: 8,
  },
  actionButton: {
    marginBottom: 12,
  },
  cancelButton: {
    borderColor: '#F44336',
  },
  joinButton: {
    marginBottom: 12,
    backgroundColor: colors.primary,
  },
  pendingChip: {
    alignSelf: 'center',
    marginBottom: 12,
  },
  rateButton: {
    marginBottom: 12,
    backgroundColor: colors.secondary,
  },
});

