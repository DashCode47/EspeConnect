import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Image,
  Linking,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Trip, TripRequest } from '../../domain/entities/trip.entity';
import { useTripStore } from '../store/trip.store';
import { useAuthStore } from '../../../../features/auth/presentation/store/auth.store';
import { colors } from '../../../../config/colors';
import { RideStackParamList } from '../../../../navigation/types';
import { useHideNavbar } from '../../../../hooks/useHideNavbar';
import { ConfirmationModal } from '../../../../components/modals/ConfirmationModal';
import { SuccessModal } from '../../../../components/modals/SuccessModal';
import { ErrorModal } from '../../../../components/modals/ErrorModal';

type TripDetailScreenRouteProp = RouteProp<RideStackParamList, 'TripDetail'>;
type TripDetailScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'TripDetail'>;

export const TripDetailScreen = () => {
  const route = useRoute<TripDetailScreenRouteProp>();
  const navigation = useNavigation<TripDetailScreenNavigationProp>();
  const { tripId } = route.params;

  const { user: profile } = useAuthStore();
  const { trips, myTrips, joinTrip, fetchTripById } = useTripStore();
  const trip = [...trips, ...myTrips].find((t: Trip) => t.id === tripId) || null;
  const [loading, setLoading] = useState(!trip);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useHideNavbar(true);

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  const fetchTripData = async () => {
    try {
      if (!trip) setLoading(true);
      await fetchTripById(tripId);
    } catch (error: any) {
      console.error('Error fetching trip:', error);
      setErrorMessage('No se pudo cargar el viaje');
      setShowErrorModal(true);
      setTimeout(() => {
        navigation.goBack();
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = () => {
    const raw = trip?.contactPhone;
    if (!raw) {
      setErrorMessage('El conductor no tiene número de contacto');
      setShowErrorModal(true);
      return;
    }
    // Convert 09XXXXXXXX → 593XXXXXXXX
    const digits = raw.replace(/\D/g, '');
    const international = digits.startsWith('0') ? '593' + digits.slice(1) : digits;
    Linking.openURL(`https://wa.me/${international}`);
  };

  const handleReserve = () => {
    if (!trip || !profile) {
      setErrorMessage('Debes iniciar sesión para reservar un viaje');
      setShowErrorModal(true);
      return;
    }

    if (trip.driverId === profile.id) {
      setErrorMessage('No puedes reservar tu propio viaje');
      setShowErrorModal(true);
      return;
    }

    setShowReserveModal(true);
  };

  const confirmReserve = async () => {
    try {
      setActionLoading(true);
      setShowReserveModal(false);
      await joinTrip(tripId);
      setShowSuccessModal(true);
      fetchTripData();
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'No se pudo reservar el viaje. Intenta nuevamente.'
      );
      setShowErrorModal(true);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonFallback}>
            <Text style={styles.backButtonFallbackText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isDriver = trip.driverId === profile?.id;
  const occupiedSeats = trip.requests?.filter((req: TripRequest) => req.status === 'ACCEPTED').length || 0;
  const totalSeats = trip.availableSeats + occupiedSeats;
  const pendingRequests = trip.requests?.filter((req: TripRequest) => req.status === 'PENDING').length || 0;
  const acceptedPassengers = trip.requests?.filter((req: TripRequest) => req.status === 'ACCEPTED') || [];

  const handleManageRequests = () => {
    navigation.navigate('ManageTripRequests', { tripId });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalles del Viaje</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Driver Profile Section */}
        <View style={styles.driverSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatarContainer}>
              {trip.driver.avatarUrl ? (
                <Image source={{ uri: trip.driver.avatarUrl }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={48} color={colors.primary} />
                </View>
              )}
            </View>
            {trip.driver.averageRating && (
              <View style={styles.ratingBadge}>
                <MaterialCommunityIcons name="star" size={14} color={colors.accent} />
                <Text style={styles.ratingText}>
                  {trip.driver.averageRating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.driverName}>{trip.driver.name}</Text>
          <Text style={styles.driverCareer}>{trip.driver.career}</Text>

          {/* Action Buttons */}
          {!isDriver && <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn} onPress={handleContact}>
              <MaterialCommunityIcons name="chat-outline" size={18} color={colors.primary} />
              <Text style={styles.quickActionText}>Mensaje</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} onPress={() => setShowSecurityModal(true)}>
              <MaterialCommunityIcons name="shield-check-outline" size={18} color={colors.success} />
              <Text style={styles.quickActionText}>Verificado</Text>
            </TouchableOpacity>
          </View>}
        </View>

        {/* Route Card */}
        <View style={styles.routeCard}>
          <View style={styles.routeCardPattern} />
          <View style={styles.routeContent}>
            {/* Dashed line connector */}
            <View style={styles.routeConnector} />

            {/* Origin */}
            <View style={styles.routePoint}>
              <View style={styles.originDot}>
                <MaterialCommunityIcons name="circle-outline" size={22} color={colors.primary} />
              </View>
              <View style={styles.routeTextContainer}>
                <Text style={styles.routeLabel}>ORIGEN</Text>
                <Text style={styles.routeValue}>{trip.origin}</Text>
              </View>
            </View>

            <View style={{ height: 32 }} />

            {/* Destination */}
            <View style={styles.routePoint}>
              <View style={styles.destinationDot}>
                <MaterialCommunityIcons name="map-marker" size={22} color="#fff" />
              </View>
              <View style={styles.routeTextContainer}>
                <Text style={[styles.routeLabel, { color: colors.accent }]}>DESTINO</Text>
                <Text style={styles.routeValue}>{trip.destination}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          {/* Schedule Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <MaterialCommunityIcons name="clock-outline" size={18} color="#999" />
              <Text style={styles.infoCardLabel}>HORARIO</Text>
            </View>
            <View style={styles.infoCardBody}>
              <Text style={styles.infoCardBigValue}>{formatTime(trip.departureTime)}</Text>
              <Text style={styles.infoCardSmallText}>Salida</Text>
            </View>
            <Text style={styles.infoCardDate}>{formatDate(trip.departureTime)}</Text>
          </View>

          {/* Vehicle Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoCardHeader}>
              <MaterialCommunityIcons name="car" size={18} color="#999" />
              <Text style={styles.infoCardLabel}>VEHÍCULO</Text>
            </View>
            <Text style={styles.vehicleModel}>Vehículo</Text>
            {trip.notes && (
              <Text style={styles.vehicleNote} numberOfLines={2}>{trip.notes}</Text>
            )}
          </View>
        </View>

        {/* Passengers Section */}
        <View style={styles.passengersSection}>
          <View style={styles.passengersSectionHeader}>
            <View style={styles.passengersTitleRow}>
              <MaterialCommunityIcons name="account-group" size={20} color={colors.primary} />
              <Text style={styles.passengersTitle}>Pasajeros</Text>
            </View>
            <View style={styles.seatsBadge}>
              <Text style={styles.seatsBadgeText}>
                {occupiedSeats}/{totalSeats} Ocupados
              </Text>
            </View>
          </View>

          <View style={styles.passengersCard}>
            <View style={styles.passengersRow}>
              {/* Accepted passengers */}
              {acceptedPassengers.map((req: TripRequest) => (
                <View key={req.id} style={styles.passengerItem}>
                  <View style={styles.passengerAvatar}>
                    {req.passenger.avatarUrl ? (
                      <Image
                        source={{ uri: req.passenger.avatarUrl }}
                        style={styles.passengerAvatarImage}
                      />
                    ) : (
                      <View style={styles.passengerAvatarPlaceholder}>
                        <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.passengerName} numberOfLines={1}>
                    {req.passenger.name?.split(' ')[0] || 'Pasajero'}
                  </Text>
                </View>
              ))}

              {/* Empty seats */}
              {Array.from({ length: trip.availableSeats }).map((_, index) => (
                <View key={`empty-${index}`} style={styles.passengerItem}>
                  <View style={styles.emptySeat}>
                    <MaterialCommunityIcons name="account-plus" size={18} color="#bbb" />
                  </View>
                  <Text style={styles.emptySeatText}>Libre</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Manage Requests Banner - Only for Driver */}
        {isDriver && (
          <TouchableOpacity
            style={styles.manageRequestsBanner}
            onPress={handleManageRequests}
            activeOpacity={0.8}
          >
            <View style={styles.manageRequestsContent}>
              <View style={styles.manageRequestsLeft}>
                <View style={styles.manageRequestsIconContainer}>
                  <MaterialCommunityIcons name="account-group" size={24} color={colors.primary} />
                </View>
                <View style={styles.manageRequestsTextContainer}>
                  <Text style={styles.manageRequestsTitle}>Gestionar Solicitudes</Text>
                  <Text style={styles.manageRequestsSubtitle}>
                    {pendingRequests > 0
                      ? `${pendingRequests} solicitud${pendingRequests > 1 ? 'es' : ''} pendiente${pendingRequests > 1 ? 's' : ''}`
                      : 'No hay solicitudes pendientes'}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
            </View>
            {pendingRequests > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingRequests}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Bottom spacing for fixed bar (only needed for passengers) */}
        {!isDriver && <View style={{ height: 120 }} />}
      </ScrollView>

      {/* Bottom Action Bar — only for passengers */}
      {!isDriver && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarInner}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Precio total</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceValue}>
                  ${trip.price?.toFixed(2) || '0.00'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (actionLoading || trip.availableSeats === 0) && styles.confirmButtonDisabled,
              ]}
              onPress={handleReserve}
              disabled={actionLoading || trip.availableSeats === 0}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Confirmar Reserva</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Modals */}
      <ConfirmationModal
        visible={showReserveModal}
        title="Reservar Viaje"
        message="¿Estás seguro de que deseas reservar este viaje? El conductor te notificará cuando acepte tu solicitud."
        confirmText="Confirmar"
        cancelText="Cancelar"
        icon="car"
        onConfirm={confirmReserve}
        onCancel={() => setShowReserveModal(false)}
      />

      <SuccessModal
        visible={showSuccessModal}
        title="¡Solicitud Enviada!"
        message="Tu solicitud ha sido enviada exitosamente. El conductor te notificará cuando la acepte."
        onClose={() => setShowSuccessModal(false)}
        icon="check-circle"
      />

      <SuccessModal
        visible={showSecurityModal}
        title="Usuario Verificado"
        message="Este usuario es un estudiante. Por tu seguridad, solo los estudiantes están autorizados para crear viajes."
        onClose={() => setShowSecurityModal(false)}
        icon="shield-check"
      />

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
    backgroundColor: '#f6f8f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    color: colors.primaryDark,
    marginBottom: 16,
    fontWeight: '600',
  },
  backButtonFallback: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  backButtonFallbackText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Driver Section
  driverSection: {
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 60,
    backgroundColor: colors.primary,
    opacity: 0.15,
  },
  avatarContainer: {
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 4,
    borderColor: '#fff',
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7f3',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: 4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  driverName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  driverCareer: {
    fontSize: 15,
    color: colors.primary,
    opacity: 0.8,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
  },

  // Route Card
  routeCard: {
    marginTop: 32,
    marginHorizontal: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#eaf4ef',
    padding: 24,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#fff',
  },
  routeCardPattern: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.06,
  },
  routeContent: {
    position: 'relative',
  },
  routeConnector: {
    position: 'absolute',
    left: 23,
    top: 48,
    bottom: 48,
    width: 0,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderLeftColor: `${colors.primary}66`,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  originDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  destinationDot: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#fff',
  },
  routeTextContainer: {
    flex: 1,
    paddingTop: 4,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: `${colors.primary}B3`,
    letterSpacing: 2,
    marginBottom: 4,
  },
  routeValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },

  // Info Grid
  infoGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    marginHorizontal: 16,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    minHeight: 104,
    justifyContent: 'center',
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  infoCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
    letterSpacing: 1.5,
  },
  infoCardBody: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  infoCardBigValue: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  infoCardSmallText: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
  },
  infoCardDate: {
    fontSize: 13,
    color: '#999',
    fontWeight: '500',
    marginTop: 4,
  },
  vehicleModel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 4,
  },
  vehicleNote: {
    fontSize: 13,
    color: '#999',
    marginTop: 6,
  },

  // Passengers Section
  passengersSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  passengersSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  passengersTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passengersTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  seatsBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  seatsBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999',
  },
  passengersCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  passengersRow: {
    flexDirection: 'row',
    gap: 16,
  },
  passengerItem: {
    alignItems: 'center',
    gap: 6,
  },
  passengerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  passengerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  passengerAvatarPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f7f3',
  },
  passengerName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
    maxWidth: 56,
    textAlign: 'center',
  },
  emptySeat: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  emptySeatText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#bbb',
  },

  // Manage Requests Banner
  manageRequestsBanner: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  manageRequestsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  manageRequestsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  manageRequestsIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eaf4ef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  manageRequestsTextContainer: {
    flex: 1,
  },
  manageRequestsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  manageRequestsSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  pendingBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 8,
    paddingLeft: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 16,
  },
  priceContainer: {
    flexShrink: 0,
  },
  priceLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '500',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.accent,
    letterSpacing: -0.5,
  },
  priceCurrency: {
    fontSize: 11,
    fontWeight: '700',
    color: '#999',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 18,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
