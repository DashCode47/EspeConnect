import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { Trip, TripRequest } from '../../domain/entities/trip.entity';

interface ActiveTripCardProps {
    trip: Trip;
    onPress: (tripId: string) => void;
    onManage: (tripId: string) => void;
    onEdit: (tripId: string) => void;
}

export const ActiveTripCard: React.FC<ActiveTripCardProps> = ({
    trip,
    onPress,
    onManage,
    onEdit
}) => {
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
        });
    };

    const pendingRequests = trip.requests?.filter((r: TripRequest) => r.status === 'PENDING').length ?? 0;
    const acceptedRequests = trip.requests?.filter((r: TripRequest) => r.status === 'ACCEPTED').length ?? 0;
    const hasRequests = (trip.requests?.filter((r: TripRequest) => r.status === 'ACCEPTED' || r.status === 'PENDING').length ?? 0) > 0;

    return (
        <TouchableOpacity
            style={styles.activeRouteCard}
            onPress={() => onPress(trip.id)}
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

                {pendingRequests > 0 ? (
                    <View style={[styles.activeRouteStatus, styles.activeRouteStatusPending]}>
                        <MaterialCommunityIcons name="account-alert" size={14} color="#D97706" />
                        <Text style={styles.statusTextPending}>
                            {pendingRequests} {pendingRequests === 1 ? 'solicitud' : 'solicitudes'}
                        </Text>
                    </View>
                ) : acceptedRequests > 0 ? (
                    <View style={[styles.activeRouteStatus, styles.activeRouteStatusConfirmed]}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusTextConfirmed}>
                            {acceptedRequests} {acceptedRequests === 1 ? 'pasajero' : 'pasajeros'}
                        </Text>
                    </View>
                ) : (
                    <View style={[styles.activeRouteStatus, styles.activeRouteStatusPending]}>
                        <MaterialCommunityIcons name="timer-sand" size={14} color="#D97706" />
                        <Text style={styles.statusTextPending}>Esperando solicitudes</Text>
                    </View>
                )}
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
                    {acceptedRequests > 0 ? (
                        <>
                            <View style={styles.passengerAvatars}>
                                {(trip.requests?.filter((r: TripRequest) => r.status === 'ACCEPTED') ?? []).slice(0, 3).map((request: TripRequest, idx: number) => (
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
                    ) : (
                        <>
                            <MaterialCommunityIcons name="seat-recline-normal" size={18} color="#9CA3AF" />
                            <Text style={styles.seatsAvailable}>{trip.availableSeats} asientos libres</Text>
                        </>
                    )}
                </View>

                <TouchableOpacity
                    onPress={() => hasRequests ? onManage(trip.id) : onEdit(trip.id)}>
                    <Text style={styles.manageText}>{hasRequests ? 'Gestionar' : 'Editar'}</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    activeRouteCard: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 15,
        elevation: 4,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    activeRouteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    activeRouteTimeContainer: {
        gap: 4,
    },
    activeRouteTimeLabel: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.BOLD,
        color: '#9CA3AF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    activeRouteTime: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 2,
    },
    activeRouteTimeValue: {
        fontSize: 24,
        fontFamily: FONT_FAMILY.BLACK,
        color: colors.primaryDark,
    },
    activeRouteTimePeriod: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primary,
    },
    activeRouteStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 6,
    },
    activeRouteStatusPending: {
        backgroundColor: '#FEF3C7',
    },
    activeRouteStatusConfirmed: {
        backgroundColor: '#D1FAE5',
    },
    statusTextPending: {
        fontSize: 11,
        fontFamily: FONT_FAMILY.BOLD,
        color: '#D97706',
    },
    statusTextConfirmed: {
        fontSize: 11,
        fontFamily: FONT_FAMILY.BOLD,
        color: '#059669',
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#059669',
    },
    activeRouteTimeline: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 20,
    },
    activeRouteDotsColumn: {
        alignItems: 'center',
        paddingVertical: 4,
    },
    activeRouteDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    activeRouteDotOrigin: {
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: `${colors.primary}40`,
    },
    activeRouteDotDest: {
        backgroundColor: colors.accent,
        borderWidth: 2,
        borderColor: `${colors.accent}40`,
    },
    activeRouteLine: {
        width: 2,
        flex: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 4,
    },
    activeRouteLocations: {
        flex: 1,
        gap: 16,
    },
    activeRouteLocation: {
        gap: 2,
    },
    activeRouteLocationName: {
        fontSize: 15,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primaryDark,
    },
    activeRouteLocationLabel: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: '#9CA3AF',
    },
    activeRouteFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
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
        alignItems: 'center',
    },
    passengerAvatar: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 2,
        borderColor: colors.white,
    },
    passengerCount: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.BOLD,
        color: '#6B7280',
    },
    seatsAvailable: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: '#9CA3AF',
    },
    manageText: {
        fontSize: 13,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primary,
    },
});
