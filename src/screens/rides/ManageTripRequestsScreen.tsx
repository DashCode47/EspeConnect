import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { tripService, Trip, TripRequest } from '../../services/trip.service';
import { useTripStore } from '../../store/tripStore';
import { colors } from '../../config/colors';
import { RideStackParamList } from '../../navigation/types';
import { useHideNavbar } from '../../hooks/useHideNavbar';
import { ConfirmationModal } from '../../components/modals/ConfirmationModal';
import { SuccessModal } from '../../components/modals/SuccessModal';
import { ErrorModal } from '../../components/modals/ErrorModal';

type ManageTripRequestsScreenRouteProp = RouteProp<RideStackParamList, 'ManageTripRequests'>;
type ManageTripRequestsScreenNavigationProp = NativeStackNavigationProp<
  RideStackParamList,
  'ManageTripRequests'
>;

export const ManageTripRequestsScreen = () => {
  const route = useRoute<ManageTripRequestsScreenRouteProp>();
  const navigation = useNavigation<ManageTripRequestsScreenNavigationProp>();
  const { tripId } = route.params;

  const { trips, myTrips, fetchTripById, confirmPassenger, rejectRequest } = useTripStore();
  const trip = [...trips, ...myTrips].find((t) => t.id === tripId) || null;
  const [loading, setLoading] = useState(!trip);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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

  const handleAccept = async (requestId: string) => {
    if (!trip) return;

    try {
      setActionLoading(requestId);
      await confirmPassenger(tripId, requestId);
      setSuccessMessage('Pasajero aceptado exitosamente');
      setShowSuccessModal(true);
      fetchTripData(); // Refrescar datos
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'No se pudo aceptar la solicitud. Intenta nuevamente.'
      );
      setShowErrorModal(true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = (requestId: string) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (!selectedRequestId) return;

    try {
      setActionLoading(selectedRequestId);
      setShowRejectModal(false);
      await rejectRequest(tripId, selectedRequestId);
      setSuccessMessage('Solicitud rechazada');
      setShowSuccessModal(true);
      fetchTripData(); // Refrescar datos
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'No se pudo rechazar la solicitud. Intenta nuevamente.'
      );
      setShowErrorModal(true);
    } finally {
      setActionLoading(null);
      setSelectedRequestId(null);
    }
  };

  const pendingRequests = trip?.requests?.filter((req) => req.status === 'PENDING') || [];
  const confirmedPassengers = trip?.requests?.filter((req) => req.status === 'ACCEPTED') || [];
  const availableSeats = trip ? trip.availableSeats - confirmedPassengers.length : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <MaterialCommunityIcons name="chevron-left" size={20} color={colors.primaryDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestionar Solicitudes</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{availableSeats}</Text>
            <Text style={styles.statLabel}>Plazas disponibles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{confirmedPassengers.length}</Text>
            <Text style={styles.statLabel}>Pasajeros confirmados</Text>
          </View>
        </View>

        {/* Pending Requests Section */}
        {pendingRequests.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>
              Solicitudes Pendientes ({pendingRequests.length})
            </Text>
            <View style={styles.requestsContainer}>
              {pendingRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <Image
                      source={{
                        uri:
                          request.passenger.avatarUrl ||
                          'https://via.placeholder.com/48',
                      }}
                      style={styles.avatar}
                    />
                    <View style={styles.requestInfo}>
                      <Text style={styles.passengerName}>{request.passenger.name}</Text>
                      <Text style={styles.passengerUniversity}>Universidad de Ejemplo</Text>
                      <Text style={styles.passengerCareer}>
                        {request.passenger.career || 'Carrera no especificada'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={styles.rejectButton}
                      onPress={() => handleReject(request.id)}
                      disabled={actionLoading === request.id}
                      activeOpacity={0.7}>
                      {actionLoading === request.id ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <Text style={styles.rejectButtonText}>Rechazar</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAccept(request.id)}
                      disabled={actionLoading === request.id || availableSeats === 0}
                      activeOpacity={0.7}>
                      {actionLoading === request.id ? (
                        <ActivityIndicator size="small" color={colors.white} />
                      ) : (
                        <Text style={styles.acceptButtonText}>Aceptar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialCommunityIcons name="check-circle" size={64} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>¡Todo en orden!</Text>
            <Text style={styles.emptyText}>
              No tienes solicitudes pendientes en este momento.
            </Text>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={() => {
                // TODO: Implementar compartir viaje
                console.log('Compartir viaje');
              }}
              activeOpacity={0.8}>
              <MaterialCommunityIcons name="share" size={18} color={colors.white} />
              <Text style={styles.shareButtonText}>Compartir Viaje</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <ConfirmationModal
        visible={showRejectModal}
        title="Rechazar Solicitud"
        message="¿Estás seguro de que deseas rechazar esta solicitud? Esta acción no se puede deshacer."
        confirmText="Rechazar"
        cancelText="Cancelar"
        type="danger"
        icon="alert-circle"
        onConfirm={confirmReject}
        onCancel={() => {
          setShowRejectModal(false);
          setSelectedRequestId(null);
        }}
      />

      <SuccessModal
        visible={showSuccessModal}
        title="¡Éxito!"
        message={successMessage}
        onClose={() => {
          setShowSuccessModal(false);
          setSuccessMessage('');
        }}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  requestsContainer: {
    gap: 16,
  },
  requestCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
  },
  requestInfo: {
    flex: 1,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  passengerUniversity: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
    marginBottom: 2,
  },
  passengerCareer: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  rejectButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.error,
  },
  acceptButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primary,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
    paddingHorizontal: 16,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});

