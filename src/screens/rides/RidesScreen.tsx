import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../config/colors';
import { RideStackParamList } from '../../navigation/types';
import { tripService, Trip } from '../../services/trip.service';
import { useUserStore } from '../../store/userStore';
import { globalStyles } from '../../config/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UbicacionActual } from '../../assets/svg/UbicacionActual';
import { Destino } from '../../assets/svg/Destino';

type RidesScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'RidesList'>;

export const RidesScreen = () => {
  const navigation = useNavigation<RidesScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { profile, fetchProfile } = useUserStore();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [origin, setOrigin] = useState('Ubicación actual');
  const [destination, setDestination] = useState('Universidad');

  useEffect(() => {
    if (!profile) {
      fetchProfile();
    }
  }, []);

  useEffect(() => {
    if (profile?.id) {
      fetchTrips();
    }
  }, [profile?.id]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await tripService.getTrips({
        page: 1,
        limit: 10,
      });
      let filteredTrips = response.data.trips;
      
      // Filtrar viajes creados por el usuario actual si tenemos el ID
      if (profile?.id) {
        filteredTrips = filteredTrips.filter((trip) => trip.driverId !== profile.id);
      }
      
      setTrips(filteredTrips);
    } catch (error) {
      console.error('Error fetching trips:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTrips();
  }, [profile?.id]);

  const handleSwapLocations = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleCreateTrip = () => {
    navigation.navigate('CreateTrip');
  };

  const handleSearchTrips = () => {
    // Navegar a resultados de búsqueda o filtrar
    navigation.navigate('RidesList');
  };

  const handleTripPress = (tripId: string) => {
    navigation.navigate('TripDetail', { tripId });
  };

  const handleMyTrips = () => {
    navigation.navigate('MyTrips');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#666" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Viajes</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.myTripsButton}
            onPress={handleMyTrips}
            activeOpacity={0.7}>
            <MaterialCommunityIcons name="car" size={20} color={colors.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons name="bell" size={20} color={colors.white} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.calendarButton}>
            <MaterialCommunityIcons name="calendar" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: globalStyles.getBottomSafeArea(insets) + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
        
        {/* Main Card */}
        <View style={styles.mainCard}>
          {/* Greeting Section */}
          <View style={styles.greetingSection}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.profileAvatar} />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={24} color={colors.primary} />
              </View>
            )}
            <View style={styles.greetingText}>
              <Text style={styles.greeting}>Hola, {profile?.name || 'Usuario'}</Text>
              <Text style={styles.question}>¿Para donde vas?</Text>
            </View>
          </View>

          {/* Location Input Fields */}
          <View style={styles.locationSection}>
            <View style={styles.locationField}>
              <UbicacionActual color={colors.primary} size={20} />
              <TextInput
                style={styles.locationInput}
                placeholder="Ubicación actual"
                placeholderTextColor="#999"
                value={origin}
                onChangeText={setOrigin}
                editable={false}
              />
            </View>
            <View style={styles.locationConnector} />
            <View style={styles.locationField}>
              <Destino color={colors.primary} size={20} />
              <TextInput
                style={styles.locationInput}
                placeholder="Universidad"
                placeholderTextColor={colors.primary}
                value={destination}
                onChangeText={setDestination}
              />
            </View>
            <TouchableOpacity
              style={styles.swapButton}
              onPress={handleSwapLocations}>
              <MaterialCommunityIcons name="swap-horizontal" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateTrip}>
              <Text style={styles.createButtonText}>Crear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearchTrips}>
              <Text style={styles.searchButtonText}>Buscar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Trips Section */}
        {trips.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={styles.sectionTitle}>Recientes</Text>
            {trips.slice(0, 5).map((trip) => (
              <TouchableOpacity
                key={trip.id}
                style={styles.recentCard}
                onPress={() => handleTripPress(trip.id)}>
                <View style={styles.recentCardLeft}>
                  <View style={styles.avatarColumn}>
                    {trip.driver.avatarUrl ? (
                      <Image
                        source={{ uri: trip.driver.avatarUrl }}
                        style={styles.recentAvatar}
                      />
                    ) : (
                      <View style={styles.recentAvatarPlaceholder}>
                        <MaterialCommunityIcons
                          name="account"
                          size={20}
                          color="#666"
                        />
                      </View>
                    )}
                    <View style={styles.recentLocations}>
                      <View style={styles.locationPin}>
                        <UbicacionActual color={colors.primary} size={12} />
                      </View>
                      <View style={styles.locationConnectorLine} />
                      <View style={styles.locationPin}>
                        <Destino color={colors.primary} size={12} />
                      </View>
                    </View>
                  </View>
                  <View style={styles.recentInfo}>
                    <Text style={styles.recentName}>
                      {trip.driver.name}
                    </Text>
                    <Text style={styles.recentCareer}>{trip.driver.career}</Text>
                    <View style={styles.locationsContainer}>
                      <View style={styles.locationsText}>
                        <Text style={styles.locationText}>{trip.origin}</Text>
                        <Text style={styles.locationText}>{trip.destination}</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <View style={styles.recentCardRight}>
                  <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>
                      ${trip.price || 0}
                    </Text>
                  </View>
                  <Text style={styles.recentTime}>
                    {formatTime(trip.departureTime)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {loading && trips.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 25,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.white,
  },
  headerButton: {
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
  myTripsButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
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
  calendarButton: {
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
  },
  mainCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  greetingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  profileAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  greetingText: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  question: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  locationSection: {
    marginBottom: 24,
    position: 'relative',
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
    left: 25, // 16px paddingHorizontal + 10px (half of 20px icon width) - 1px (half of 2px connector width)
    top: 48, // 14px paddingVertical + 20px icon height + 14px paddingVertical bottom
    width: 2,
    height: 8, // Height of marginBottom between fields
    backgroundColor: colors.primary,
    zIndex: 0,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primaryDark,
  },
  swapButton: {
    position: 'absolute',
    right: 20,
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  createButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  searchButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  recentSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 16,
  },
  recentCard: {
    width: '100%',
    maxWidth: 354,
    height: 137,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  recentCardLeft: {
    flexDirection: 'row',
    flex: 1,
    gap: 12,
  },
  avatarColumn: {
    alignItems: 'center',
    gap: 4,
  },
  recentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 2,
  },
  recentAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 2,
    backgroundColor: '#D9D9D9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentInfo: {
    flex: 1,
  },
  recentName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'LeagueSpartan-SemiBold',
    color: '#131413',
    marginBottom: 4,
    lineHeight: 17.6, // 16 * 1.1
  },
  recentCareer: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'LeagueSpartan-SemiBold',
    color: '#B6B6B6',
    marginBottom: 8,
    lineHeight: 11, // 10 * 1.1
  },
  recentLocations: {
    alignItems: 'center',
    gap: 2,
    marginTop: 20,
  },
  locationPin: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationConnectorLine: {
    width: 1,
    height: 8,
    backgroundColor: colors.primary,
    marginVertical: 1,
  },
  locationsContainer: {
    marginTop: 16,
  },
  locationsText: {
    gap: 8,
  },
  locationText: {
    fontSize: 13.04,
    fontWeight: '600',
    fontFamily: 'LeagueSpartan-SemiBold',
    color: '#131413',
    lineHeight: 14.34, // 13.04 * 1.1
  },
  recentCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  priceBadge: {
    height: 38,
    backgroundColor: '#F0F7F4',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#0E6940',
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'LeagueSpartan-Bold',
    color: '#252424',
    lineHeight: 22, // 20 * 1.1
  },
  recentTime: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'LeagueSpartan-SemiBold',
    color: '#131413',
    textAlign: 'right',
    lineHeight: 11, // 10 * 1.1
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
