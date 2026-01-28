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
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { tripService, Trip } from '../../services/trip.service';
import { useUserStore } from '../../store/userStore';
import { colors } from '../../config/colors';
import { RideStackParamList } from '../../navigation/types';
import { UbicacionActual } from '../../assets/svg/UbicacionActual';
import { Destino } from '../../assets/svg/Destino';
import { useHideNavbar } from '../../hooks/useHideNavbar';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { SuccessModal } from '../../components/modals/SuccessModal';
import { ErrorModal } from '../../components/modals/ErrorModal';

type TripDetailScreenRouteProp = RouteProp<RideStackParamList, 'TripDetail'>;
type TripDetailScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'TripDetail'>;

export const TripDetailScreen = () => {
  const route = useRoute<TripDetailScreenRouteProp>();
  const navigation = useNavigation<TripDetailScreenNavigationProp>();
  const { tripId } = route.params;

  const { profile } = useUserStore();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useHideNavbar(true);

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTripById(tripId);
      setTrip(response.data.trip);
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
    // TODO: Implementar contacto con el conductor
    setErrorMessage('Funcionalidad de contacto próximamente');
    setShowErrorModal(true);
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
      await tripService.joinTrip(tripId);
      setShowSuccessModal(true);
      fetchTrip();
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
      hour12: true,
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Volver</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isDriver = trip.driverId === profile?.id;
  const occupiedSeats = trip.requests?.filter((req) => req.status === 'ACCEPTED').length || 0;
  const totalSeats = trip.availableSeats + occupiedSeats;
  const pendingRequests = trip.requests?.filter((req) => req.status === 'PENDING').length || 0;

  const handleManageRequests = () => {
    navigation.navigate('ManageTripRequests', { tripId });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalle del viaje</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons name="bell" size={20} color={colors.white} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.bookmarkButton}>
            <MaterialCommunityIcons name="bookmark" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Driver Info and Price */}
        <View style={styles.driverSection}>
          <View style={styles.driverInfo}>
            {trip.driver.avatarUrl ? (
              <Image source={{ uri: trip.driver.avatarUrl }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialCommunityIcons name="account" size={32} color={colors.primary} />
              </View>
            )}
            <View style={styles.driverText}>
              <Text style={styles.driverName}>{trip.driver.name}</Text>
              <Text style={styles.driverCareer}>{trip.driver.career}</Text>
            </View>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceText}>${trip.price?.toFixed(0) || '0'}</Text>
          </View>
        </View>

        {/* Location Card */}
        <View style={styles.locationCard}>
          <View style={styles.locationField}>
            <UbicacionActual color={colors.primary} size={20} />
            <Text style={styles.locationText}>{trip.origin}</Text>
          </View>
          <View style={styles.locationConnector} />
          <View style={styles.locationField}>
            <Destino color={colors.primary} size={20} />
            <Text style={[styles.locationText, styles.destinationText]}>{trip.destination}</Text>
          </View>
        </View>

        {/* Trip Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Fecha</Text>
              <View style={styles.detailValueContainer}>
                <MaterialCommunityIcons name="calendar" size={20} color={colors.primaryDark} />
                <Text style={styles.detailValue}>{formatDate(trip.departureTime)}</Text>
              </View>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Hora</Text>
              <View style={styles.detailValueContainer}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={colors.primaryDark} />
                <Text style={styles.detailValue}>{formatTime(trip.departureTime)}</Text>
              </View>
            </View>
          </View>
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Vehículo</Text>
              <Text style={styles.detailValue}>AKA745</Text>
              <Text style={styles.detailSubValue}>Audi A3 Sportback</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Cupos: {occupiedSeats}/{totalSeats}</Text>
              <View style={styles.seatsContainer}>
                {Array.from({ length: totalSeats }).map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.seatIcon,
                      index < occupiedSeats ? styles.seatOccupied : styles.seatAvailable,
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Duration and Distance */}
        <View style={styles.durationCard}>
          <Text style={styles.durationText}>Duración aproximada: 30m</Text>
          <View style={styles.distanceContainer}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.primaryDark} />
            <Text style={styles.distanceText}>A 100m</Text>
          </View>
        </View>

        {/* Manage Requests Banner - Only for Driver */}
        {isDriver && (
          <TouchableOpacity
            style={styles.manageRequestsBanner}
            onPress={handleManageRequests}
            activeOpacity={0.8}>
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
              <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primaryDark} />
            </View>
            {pendingRequests > 0 && (
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>{pendingRequests}</Text>
              </View>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        {isDriver ? (
          <TouchableOpacity
            style={styles.manageRequestsButton}
            onPress={handleManageRequests}
            activeOpacity={0.8}>
            <MaterialCommunityIcons name="account-group" size={20} color={colors.white} />
            <Text style={styles.manageRequestsButtonText}>
              {pendingRequests > 0
                ? `Gestionar Solicitudes (${pendingRequests})`
                : 'Gestionar Solicitudes'}
            </Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={handleContact}
              disabled={actionLoading}>
              <Text style={styles.contactButtonText}>Contactar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.reserveButton}
              onPress={handleReserve}
              disabled={actionLoading || trip.availableSeats === 0}>
              <Text style={styles.reserveButtonText}>Reservar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

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
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.primaryDark,
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
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profileImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  driverText: {
    marginLeft: 12,
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  driverCareer: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  priceBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  locationField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 8,
    gap: 12,
  },
  locationConnector: {
    position: 'absolute',
    left: 30,
    top: 42,
    width: 2,
    height: 20,
    backgroundColor: colors.primary,
    zIndex: 0,
  },
  locationText: {
    fontSize: 16,
    color: colors.primaryDark,
    flex: 1,
  },
  destinationText: {
    color: colors.primary,
    fontWeight: '600',
  },
  detailsCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  detailSubValue: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  seatsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  seatIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  seatOccupied: {
    backgroundColor: colors.primary,
  },
  seatAvailable: {
    backgroundColor: '#E0E0E0',
  },
  durationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  durationText: {
    fontSize: 14,
    color: colors.primaryDark,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 14,
    color: colors.primaryDark,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 20,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    gap: 12,
  },
  contactButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  reserveButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reserveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  manageRequestsBanner: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
    backgroundColor: '#E8F5E9',
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
    borderColor: colors.white,
  },
  pendingBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  manageRequestsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  manageRequestsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
