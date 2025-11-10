import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { tripService, Trip, CreateRatingData } from '../../services/trip.service';
import { colors } from '../../config/colors';
import { RideStackParamList } from '../../navigation/types';

type RateDriverScreenRouteProp = RouteProp<RideStackParamList, 'RateDriver'>;
type RateDriverScreenNavigationProp = NativeStackNavigationProp<
  RideStackParamList,
  'RateDriver'
>;

export const RateDriverScreen = () => {
  const route = useRoute<RateDriverScreenRouteProp>();
  const navigation = useNavigation<RateDriverScreenNavigationProp>();
  const { tripId } = route.params;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

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
      Alert.alert('Error', 'No se pudo cargar el viaje');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRatingPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Por favor selecciona una calificación');
      return;
    }

    try {
      setSubmitting(true);
      const ratingData: CreateRatingData = {
        rating,
        comment: comment.trim() || undefined,
      };
      await tripService.rateDriver(tripId, ratingData);
      Alert.alert('Éxito', 'Calificación enviada exitosamente', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('TripDetail', { tripId });
          },
        },
      ]);
    } catch (error: any) {
      console.error('Error rating driver:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo enviar la calificación. Intenta nuevamente.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando...</Text>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calificar Conductor</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Driver Info */}
        <View style={styles.driverCard}>
          <View style={styles.driverHeader}>
            {trip.driver.avatarUrl ? (
              <MaterialCommunityIcons name="account-circle" size={64} color={colors.primary} />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={64} color={colors.primary} />
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
        </View>

        {/* Trip Info */}
        <View style={styles.tripCard}>
          <Text style={styles.sectionTitle}>Viaje</Text>
          <View style={styles.tripInfo}>
            <MaterialCommunityIcons name="map-marker" size={20} color={colors.primary} />
            <Text style={styles.tripText}>{trip.origin}</Text>
          </View>
          <View style={styles.tripInfo}>
            <MaterialCommunityIcons name="map-marker-check" size={20} color={colors.secondary} />
            <Text style={styles.tripText}>{trip.destination}</Text>
          </View>
        </View>

        {/* Rating Selection */}
        <View style={styles.ratingCard}>
          <Text style={styles.sectionTitle}>¿Cómo calificarías este viaje?</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                style={styles.starButton}
                onPress={() => handleRatingPress(star)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={48}
                  color={star <= rating ? '#FFD700' : '#CCC'}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingLabel}>
              {rating === 1
                ? 'Muy malo'
                : rating === 2
                ? 'Malo'
                : rating === 3
                ? 'Regular'
                : rating === 4
                ? 'Bueno'
                : 'Excelente'}
            </Text>
          )}
        </View>

        {/* Comment Section */}
        <View style={styles.commentCard}>
          <Text style={styles.sectionTitle}>Comentario (Opcional)</Text>
          <Text style={styles.commentHint}>
            Comparte tu experiencia con otros pasajeros
          </Text>
          <View style={styles.commentInputContainer}>
            <Text
              style={styles.commentInput}
              onPress={() => {
                // TODO: Implement text input for comment
                Alert.alert('Info', 'Funcionalidad de comentario pendiente');
              }}
            >
              {comment || 'Escribe tu comentario aquí...'}
            </Text>
          </View>
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting || rating === 0}
          style={styles.submitButton}
        >
          Enviar Calificación
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  driverCard: {
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
  },
  driverInfo: {
    marginLeft: 16,
    flex: 1,
  },
  driverName: {
    fontSize: 20,
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
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  tripCard: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  tripInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tripText: {
    fontSize: 16,
    color: colors.black,
    marginLeft: 12,
  },
  ratingCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 24,
    gap: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.black,
    marginTop: 8,
  },
  commentCard: {
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
  commentHint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  commentInputContainer: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
  },
  commentInput: {
    fontSize: 16,
    color: colors.black,
    minHeight: 80,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: colors.primary,
  },
});

