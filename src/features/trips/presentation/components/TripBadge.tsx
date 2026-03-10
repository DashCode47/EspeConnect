import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Chip } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../config/colors';
import { Trip, TripRequest } from '../../domain/entities/trip.entity';

interface TripBadgeProps {
    trip: Trip;
    myRequest?: TripRequest;
    style?: ViewStyle;
}

export const TripBadge: React.FC<TripBadgeProps> = ({ trip, myRequest, style }) => {
    return (
        <View style={[styles.tripBadge, style]}>
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
            {trip.userRole === 'passenger' && myRequest && (
                <Chip
                    icon={() => (
                        <MaterialCommunityIcons
                            name={
                                myRequest.status === 'ACCEPTED' ? 'check-decagram' :
                                    myRequest.status === 'PENDING' ? 'clock-outline' : 'close-circle'
                            }
                            size={16}
                            color={colors.white}
                        />
                    )}
                    style={[
                        styles.statusChip,
                        {
                            backgroundColor:
                                myRequest.status === 'ACCEPTED' ? '#4CAF50' :
                                    myRequest.status === 'PENDING' ? '#FBC02D' : '#F44336',
                        },
                    ]}
                    textStyle={styles.statusChipText}
                >
                    {myRequest.status === 'ACCEPTED' ? 'Aceptado' :
                        myRequest.status === 'PENDING' ? 'Solicitado' : 'Rechazado'}
                </Chip>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    tripBadge: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 8,
        paddingHorizontal: 4,
        flexWrap: 'wrap',
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
});
