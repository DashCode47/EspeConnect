import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../config/colors';

export interface Ride {
  id: string;
  driver: {
    id: string;
    name: string;
    avatarUrl?: string | null;
    isVerified?: boolean;
    role?: string; // "Conductora verificada" | "Estudiante"
  };
  route: {
    from: string;
    to: string;
  };
  schedule: {
    departureTime: string; // "18:00h"
  };
  seats: {
    available: number;
  };
  price: {
    type: 'fixed' | 'voluntary'; // 'fixed' para precio fijo, 'voluntary' para aporte voluntario
    amount?: number; // Solo si type es 'fixed'
  };
}

interface RideCardProps {
  ride: Ride;
  onJoinPress?: (rideId: string) => void;
}

export const RideCard = ({ ride, onJoinPress }: RideCardProps) => {
  const formatRoute = () => {
    return `${ride.route.from} → ${ride.route.to}`;
  };

  const formatPrice = () => {
    if (ride.price.type === 'voluntary') {
      return 'Aporte voluntario';
    }
    return `$${ride.price.amount?.toFixed(2)}`;
  };

  const getPriceIcon = () => {
    return ride.price.type === 'voluntary' ? 'heart' : 'cash';
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Driver Info */}
        <View style={styles.driverSection}>
          {ride.driver.avatarUrl ? (
            <Image
              source={{ uri: ride.driver.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Text
              size={48}
              label={ride.driver.name.charAt(0).toUpperCase()}
              style={styles.avatar}
            />
          )}
          <View style={styles.driverInfo}>
            <Text style={styles.driverName}>{ride.driver.name}</Text>
            <Text style={styles.driverRole}>
              {ride.driver.role || (ride.driver.isVerified ? 'Conductor verificado' : 'Estudiante')}
            </Text>
          </View>
        </View>

        {/* Route Info */}
        <View style={styles.routeSection}>
          <View style={styles.routeItem}>
            <MaterialCommunityIcons
              name="map-marker"
              size={20}
              color="#555555"
            />
            <Text style={styles.routeText}>{formatRoute()}</Text>
          </View>

          <View style={styles.routeItem}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={20}
              color="#555555"
            />
            <Text style={styles.scheduleText}>Salida: {ride.schedule.departureTime}</Text>
          </View>

          <View style={styles.routeItem}>
            <MaterialCommunityIcons
              name="seat"
              size={20}
              color="#555555"
            />
            <Text style={styles.seatsText}>
              {ride.seats.available} {ride.seats.available === 1 ? 'asiento disponible' : 'asientos disponibles'}
            </Text>
          </View>
        </View>

        {/* Price and Join Button */}
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <MaterialCommunityIcons
              name={getPriceIcon()}
              size={20}
              color="#F1C40F"
            />
            {ride.price.type === 'fixed' ? (
              <Text style={styles.priceText}>
                {formatPrice()} <Text style={styles.priceUnit}>/ persona</Text>
              </Text>
            ) : (
              <Text style={styles.priceText}>{formatPrice()}</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => onJoinPress?.(ride.id)}
            activeOpacity={0.8}
          >
            <Text style={styles.joinButtonText}>Unirme</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    backgroundColor: colors.primary,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  driverRole: {
    fontSize: 14,
    color: '#555555',
    marginTop: 2,
  },
  routeSection: {
    gap: 12,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    flex: 1,
  },
  scheduleText: {
    fontSize: 14,
    color: '#555555',
  },
  seatsText: {
    fontSize: 14,
    color: '#555555',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#555555',
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 84,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

