import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { Trip, TripStatus, TripRequest } from '../../domain/entities/trip.entity';

interface TripCardProps {
    trip: Trip;
    index: number;
    onPress: (tripId: string) => void;
    onReserve: (tripId: string) => void;
    currentUserId?: string;
}

export const TripCard: React.FC<TripCardProps> = ({
    trip,
    index,
    onPress,
    onReserve,
    currentUserId
}) => {
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
        if (trip.ratings && trip.ratings.length > 0) {
            const avg = trip.ratings.reduce((acc: number, r: any) => acc + r.rating, 0) / trip.ratings.length;
            return avg.toFixed(1);
        }
        return '5.0';
    };

    const seatsInfo = getSeatsInfo(trip.availableSeats, trip.status);
    const isFull = seatsInfo.isFull;
    const rating = getDriverRating(trip);

    const myRequest = trip.requests?.find((req: TripRequest) => req.passengerId === currentUserId);
    const isRequested = !!myRequest;
    const requestStatus = myRequest?.status;

    return (
        <TouchableOpacity
            style={[styles.tripCard, isFull && styles.tripCardFull]}
            onPress={() => !isFull && onPress(trip.id)}
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
                    style={[
                        styles.reserveButton,
                        (isFull || isRequested) && styles.reserveButtonDisabled,
                        isRequested && requestStatus === 'ACCEPTED' && styles.reserveButtonSuccess
                    ]}
                    onPress={() => !isFull && !isRequested && onReserve(trip.id)}
                    disabled={isFull || isRequested}
                    activeOpacity={0.8}>
                    <Text style={[styles.reserveButtonText, (isFull || isRequested) && styles.reserveButtonTextDisabled]}>
                        {isFull ? 'Agotado' : isRequested ? (requestStatus === 'ACCEPTED' ? 'Aceptado' : 'Solicitado') : 'Reservar'}
                    </Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tripCard: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.03)',
    },
    tripCardFull: {
        opacity: 0.8,
    },
    fullOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderRadius: 20,
        zIndex: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullBadge: {
        backgroundColor: '#374151',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
        transform: [{ rotate: '-5deg' }],
    },
    fullBadgeText: {
        color: colors.white,
        fontFamily: FONT_FAMILY.BOLD,
        fontSize: 12,
        textTransform: 'uppercase',
    },
    tripCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
        borderColor: colors.primary,
        padding: 2,
    },
    avatarWrapperFull: {
        borderColor: '#D1D5DB',
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
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    ratingBadge: {
        position: 'absolute',
        bottom: -4,
        right: -4,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        gap: 2,
        borderWidth: 2,
        borderColor: colors.white,
    },
    ratingText: {
        color: colors.white,
        fontSize: 10,
        fontFamily: FONT_FAMILY.BOLD,
    },
    driverDetails: {
        gap: 1,
    },
    driverName: {
        fontSize: 16,
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primaryDark,
    },
    driverCareer: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: '#6B7280',
    },
    priceBadge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    priceBadgeFull: {
        backgroundColor: '#D1D5DB',
        shadowOpacity: 0.1,
    },
    priceText: {
        color: colors.white,
        fontSize: 18,
        fontFamily: FONT_FAMILY.BOLD,
    },
    priceTextFull: {
        color: '#6B7280',
    },
    routeTimeline: {
        flexDirection: 'row',
        gap: 16,
        paddingLeft: 4,
        marginBottom: 16,
    },
    routeTimelineFull: {
        opacity: 0.6,
    },
    timeColumn: {
        alignItems: 'center',
        gap: 4,
        width: 45,
    },
    timeText: {
        fontSize: 12,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: '#6B7280',
    },
    timeBold: {
        fontFamily: FONT_FAMILY.BOLD,
        color: colors.primaryDark,
    },
    timeConnector: {
        width: 1,
        height: 20,
        backgroundColor: '#E5E7EB',
    },
    routeContainer: {
        flex: 1,
        gap: 12,
        justifyContent: 'center',
    },
    routeContainerFull: {},
    routeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    routeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    routeDotOrigin: {
        backgroundColor: colors.primary,
        borderWidth: 2,
        borderColor: `${colors.primary}40`,
    },
    routeDotDestination: {
        backgroundColor: colors.accent,
        borderWidth: 2,
        borderColor: `${colors.accent}40`,
    },
    routeDotFull: {
        backgroundColor: '#D1D5DB',
        borderColor: '#E5E7EB',
    },
    routeText: {
        fontSize: 14,
        fontFamily: FONT_FAMILY.MEDIUM,
        color: colors.primaryDark,
        flex: 1,
    },
    tripCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    seatsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    seatsText: {
        fontSize: 13,
        fontFamily: FONT_FAMILY.BOLD,
        color: '#6B7280',
    },
    seatsTextLow: {
        color: '#EF4444',
    },
    reserveButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
    },
    reserveButtonDisabled: {
        backgroundColor: '#F3F4F6',
    },
    reserveButtonSuccess: {
        backgroundColor: '#DEF7EC',
    },
    reserveButtonText: {
        color: colors.white,
        fontSize: 14,
        fontFamily: FONT_FAMILY.BOLD,
    },
    reserveButtonTextDisabled: {
        color: '#9CA3AF',
    },
    textMuted: {
        color: '#9CA3AF',
    },
});
