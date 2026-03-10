import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { Trip, TripRequest } from '../../domain/entities/trip.entity';
import { RideCard, Ride } from './RideCard';
import { TripBadge } from './TripBadge';

interface MyTripItemProps {
    trip: Trip;
    profileId?: string;
    onPress: (id: string) => void;
    onManageRequests?: (id: string) => void;
    convertTripToRide: (trip: Trip) => Ride;
}

export const MyTripItem: React.FC<MyTripItemProps> = ({
    trip,
    profileId,
    onPress,
    onManageRequests,
    convertTripToRide,
}) => {
    const myRequest = trip.requests?.find(r => r.passengerId === profileId);
    const isRequested = !!myRequest;
    const isExpired = new Date(trip.departureTime) < new Date();

    return (
        <View style={[styles.tripCardContainer, isExpired && styles.expiredCard]}>
            <TripBadge trip={trip} myRequest={myRequest} />
            <TouchableOpacity
                onPress={() => onPress(trip.id)}
                activeOpacity={0.7}>
                <RideCard
                    ride={convertTripToRide(trip)}
                    onJoinPress={trip.userRole !== 'driver' && !isRequested && !isExpired ? () => onPress(trip.id) : undefined}
                />
            </TouchableOpacity>
            {trip.userRole === 'driver' && trip.status === 'ACTIVE' && !isExpired && (
                <TouchableOpacity
                    style={styles.manageButton}
                    onPress={() => onManageRequests?.(trip.id)}
                    activeOpacity={0.7}>
                    <MaterialCommunityIcons name="account-group" size={18} color={colors.primary} />
                    <Text style={styles.manageButtonText}>Gestionar Solicitudes</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    tripCardContainer: {
        marginBottom: 16,
    },
    expiredCard: {
        opacity: 0.6,
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
});
