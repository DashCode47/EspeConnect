import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { SuccessModal } from '../../components/modals/SuccessModal';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { tripService, UpdateTripData, Trip } from '../../services/trip.service';
import { colors } from '../../config/colors';
import { RideStackParamList } from '../../navigation/types';

type EditTripScreenRouteProp = RouteProp<RideStackParamList, 'EditTrip'>;
type EditTripScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'EditTrip'>;

export const EditTripScreen = () => {
  const route = useRoute<EditTripScreenRouteProp>();
  const navigation = useNavigation<EditTripScreenNavigationProp>();
  const { tripId } = route.params;

  const [loading, setLoading] = useState(false);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [formData, setFormData] = useState<UpdateTripData>({
    origin: '',
    destination: '',
    departureTime: undefined,
    availableSeats: undefined,
    price: undefined,
    notes: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      setLoadingTrip(true);
      const response = await tripService.getTripById(tripId);
      const tripData = response.data.trip;
      setTrip(tripData);
      setFormData({
        origin: tripData.origin,
        destination: tripData.destination,
        departureTime: tripData.departureTime,
        availableSeats: tripData.availableSeats,
        price: tripData.price || undefined,
        notes: tripData.notes || '',
      });
      setTempDate(new Date(tripData.departureTime));
    } catch (error: any) {
      console.error('Error fetching trip:', error);
      Alert.alert('Error', 'No se pudo cargar el viaje');
      navigation.goBack();
    } finally {
      setLoadingTrip(false);
    }
  };

  const handleInputChange = (field: keyof UpdateTripData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openDatePicker = () => {
    setTempDate(formData.departureTime ? new Date(formData.departureTime) : new Date());
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    setTempDate(formData.departureTime ? new Date(formData.departureTime) : new Date());
    setShowTimePicker(true);
  };

  const confirmDate = () => {
    const newDateTime = new Date(tempDate);
    const currentTime = formData.departureTime
      ? new Date(formData.departureTime)
      : new Date();
    newDateTime.setHours(currentTime.getHours());
    newDateTime.setMinutes(currentTime.getMinutes());
    handleInputChange('departureTime', newDateTime.toISOString());
    setShowDatePicker(false);
  };

  const confirmTime = () => {
    const newDateTime = formData.departureTime
      ? new Date(formData.departureTime)
      : new Date();
    newDateTime.setHours(tempDate.getHours());
    newDateTime.setMinutes(tempDate.getMinutes());
    handleInputChange('departureTime', newDateTime.toISOString());
    setShowTimePicker(false);
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(newDate.getDate() + days);
    if (newDate >= new Date()) {
      setTempDate(newDate);
    }
  };

  const adjustMonth = (months: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(newDate.getMonth() + months);
    if (newDate >= new Date()) {
      setTempDate(newDate);
    }
  };

  const adjustHour = (hours: number) => {
    const newDate = new Date(tempDate);
    newDate.setHours(newDate.getHours() + hours);
    if (newDate.getHours() < 0) {
      newDate.setHours(23);
    } else if (newDate.getHours() > 23) {
      newDate.setHours(0);
    }
    setTempDate(newDate);
  };

  const adjustMinute = (minutes: number) => {
    const newDate = new Date(tempDate);
    newDate.setMinutes(newDate.getMinutes() + minutes);
    if (newDate.getMinutes() < 0) {
      newDate.setMinutes(59);
      newDate.setHours(newDate.getHours() - 1);
    } else if (newDate.getMinutes() > 59) {
      newDate.setMinutes(0);
      newDate.setHours(newDate.getHours() + 1);
    }
    setTempDate(newDate);
  };

  const validateForm = (): boolean => {
    if (formData.origin && !formData.origin.trim()) {
      Alert.alert('Error', 'El origen no puede estar vacío');
      return false;
    }
    if (formData.destination && !formData.destination.trim()) {
      Alert.alert('Error', 'El destino no puede estar vacío');
      return false;
    }
    if (formData.availableSeats !== undefined && formData.availableSeats < 1) {
      Alert.alert('Error', 'Debe haber al menos 1 asiento disponible');
      return false;
    }
    if (trip && formData.availableSeats !== undefined) {
      const acceptedPassengers = trip.requests?.filter(
        (req) => req.status === 'ACCEPTED'
      ).length || 0;
      if (formData.availableSeats < acceptedPassengers) {
        Alert.alert(
          'Error',
          `No puedes tener menos asientos que pasajeros ya aceptados (${acceptedPassengers})`
        );
        return false;
      }
    }
    if (formData.departureTime) {
      const departureDate = new Date(formData.departureTime);
      const now = new Date();
      if (departureDate <= now) {
        Alert.alert('Error', 'La fecha y hora de salida debe ser en el futuro');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    // Only send fields that have been changed
    const updateData: UpdateTripData = {};
    if (formData.origin && formData.origin !== trip?.origin) {
      updateData.origin = formData.origin;
    }
    if (formData.destination && formData.destination !== trip?.destination) {
      updateData.destination = formData.destination;
    }
    if (formData.departureTime && formData.departureTime !== trip?.departureTime) {
      updateData.departureTime = formData.departureTime;
    }
    if (formData.availableSeats !== undefined && formData.availableSeats !== trip?.availableSeats) {
      updateData.availableSeats = formData.availableSeats;
    }
    if (formData.price !== trip?.price) {
      updateData.price = formData?.price;
    }
    if (formData.notes !== trip?.notes) {
      updateData.notes = formData?.notes;
    }

    if (Object.keys(updateData).length === 0) {
      Alert.alert('Info', 'No hay cambios para guardar');
      return;
    }

    try {
      setLoading(true);
      await tripService.updateTrip(tripId, updateData);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error updating trip:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo actualizar el viaje. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'No seleccionado';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loadingTrip) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
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
        <Text style={styles.headerTitle}>Editar Viaje</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Información del Viaje</Text>

        {/* Origin */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Origen</Text>
          <TextInput
            mode="outlined"
            placeholder="Ej: Campus Sangolquí"
            value={formData.origin}
            onChangeText={(text) => handleInputChange('origin', text)}
            style={styles.input}
            left={<TextInput.Icon icon="map-marker" />}
          />
        </View>

        {/* Destination */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Destino</Text>
          <TextInput
            mode="outlined"
            placeholder="Ej: Quicentro Shopping"
            value={formData.destination}
            onChangeText={(text) => handleInputChange('destination', text)}
            style={styles.input}
            left={<TextInput.Icon icon="map-marker-check" />}
          />
        </View>

        {/* Date and Time */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Fecha y Hora de Salida</Text>
          
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={openDatePicker}
              activeOpacity={0.7}
            >
              <View style={styles.dateTimeButtonContent}>
                <MaterialCommunityIcons name="calendar" size={24} color={colors.primary} />
                <View style={styles.dateTimeTextContainer}>
                  <Text style={styles.dateTimeLabel}>Fecha</Text>
                  <Text style={styles.dateTimeValue}>
                    {formData.departureTime
                      ? new Date(formData.departureTime).toLocaleDateString('es-ES', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'No seleccionada'}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={openTimePicker}
              activeOpacity={0.7}
            >
              <View style={styles.dateTimeButtonContent}>
                <MaterialCommunityIcons name="clock-outline" size={24} color={colors.primary} />
                <View style={styles.dateTimeTextContainer}>
                  <Text style={styles.dateTimeLabel}>Hora</Text>
                  <Text style={styles.dateTimeValue}>
                    {formData.departureTime
                      ? new Date(formData.departureTime).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'No seleccionada'}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Selecciona la fecha y hora de salida del viaje
          </Text>
        </View>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerRow}>
                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Día</Text>
                    <View style={styles.pickerControls}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustDate(-1)}
                      >
                        <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.pickerValue}>
                        {tempDate.getDate()}
                      </Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustDate(1)}
                      >
                        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Mes</Text>
                    <View style={styles.pickerControls}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustMonth(-1)}
                      >
                        <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.pickerValue}>
                        {tempDate.toLocaleDateString('es-ES', { month: 'short' })}
                      </Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustMonth(1)}
                      >
                        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Año</Text>
                    <View style={styles.pickerControls}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustMonth(-12)}
                      >
                        <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.pickerValue}>
                        {tempDate.getFullYear()}
                      </Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustMonth(12)}
                      >
                        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.selectedDatePreview}>
                  <Text style={styles.selectedDateText}>
                    {tempDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={confirmDate}
                  style={styles.confirmButton}
                >
                  Confirmar Fecha
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Seleccionar Hora</Text>
                <TouchableOpacity
                  onPress={() => setShowTimePicker(false)}
                  style={styles.modalCloseButton}
                >
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.pickerContainer}>
                <View style={styles.pickerRow}>
                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Hora</Text>
                    <View style={styles.pickerControls}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustHour(1)}
                      >
                        <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.pickerValue}>
                        {tempDate.getHours().toString().padStart(2, '0')}
                      </Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustHour(-1)}
                      >
                        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.pickerColumn}>
                    <Text style={styles.pickerLabel}>Minutos</Text>
                    <View style={styles.pickerControls}>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustMinute(15)}
                      >
                        <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                      </TouchableOpacity>
                      <Text style={styles.pickerValue}>
                        {tempDate.getMinutes().toString().padStart(2, '0')}
                      </Text>
                      <TouchableOpacity
                        style={styles.pickerButton}
                        onPress={() => adjustMinute(-15)}
                      >
                        <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={styles.selectedDatePreview}>
                  <Text style={styles.selectedDateText}>
                    {tempDate.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Button
                  mode="contained"
                  onPress={confirmTime}
                  style={styles.confirmButton}
                >
                  Confirmar Hora
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* Available Seats */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Asientos Disponibles</Text>
          <Text style={styles.hint}>
            Pasajeros aceptados: {trip.requests?.filter((req) => req.status === 'ACCEPTED').length || 0}
          </Text>
          <View style={styles.seatsContainer}>
            <TouchableOpacity
              style={styles.seatButton}
              onPress={() =>
                handleInputChange(
                  'availableSeats',
                  Math.max(1, (formData.availableSeats || trip.availableSeats) - 1)
                )
              }
            >
              <MaterialCommunityIcons name="minus" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.seatsValue}>
              {formData.availableSeats ?? trip.availableSeats}
            </Text>
            <TouchableOpacity
              style={styles.seatButton}
              onPress={() =>
                handleInputChange(
                  'availableSeats',
                  (formData.availableSeats ?? trip.availableSeats) + 1
                )
              }
            >
              <MaterialCommunityIcons name="plus" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Precio</Text>
          <TextInput
            mode="outlined"
            placeholder="Dejar vacío para aporte voluntario"
            value={formData.price?.toString() || ''}
            onChangeText={(text) => {
              const numValue = parseFloat(text);
              handleInputChange('price', isNaN(numValue) ? undefined : numValue);
            }}
            keyboardType="decimal-pad"
            style={styles.input}
            left={<TextInput.Icon icon="cash" />}
          />
          <Text style={styles.hint}>Deja vacío si es aporte voluntario</Text>
        </View>

        {/* Notes */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notas</Text>
          <TextInput
            mode="outlined"
            placeholder="Información adicional sobre el viaje..."
            value={formData.notes}
            onChangeText={(text) => handleInputChange('notes', text)}
            multiline
            numberOfLines={4}
            style={styles.textArea}
            left={<TextInput.Icon icon="note-text" />}
          />
        </View>

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Guardar Cambios
        </Button>
      </ScrollView>

      <SuccessModal
        visible={showSuccessModal}
        title="¡Viaje actualizado!"
        message="Los cambios en tu viaje han sido guardados exitosamente."
        buttonText="Ver viaje"
        icon="check-circle"
        onClose={() => {
          setShowSuccessModal(false);
          navigation.navigate('TripDetail', { tripId });
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingBottom: 70,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.white,
  },
  textArea: {
    backgroundColor: colors.white,
    minHeight: 100,
  },
  hint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    color: colors.black,
    marginLeft: 12,
    flex: 1,
  },
  pickerButton: {
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  pickerButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  seatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  seatButton: {
    padding: 8,
  },
  seatsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.black,
    marginHorizontal: 24,
    minWidth: 40,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: colors.primary,
  },
  dateTimeContainer: {
    gap: 12,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  dateTimeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateTimeTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  dateTimeValue: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
  },
  modalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  pickerContainer: {
    padding: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  pickerColumn: {
    alignItems: 'center',
    flex: 1,
  },
  pickerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  pickerControls: {
    alignItems: 'center',
  },
  pickerValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.black,
    marginVertical: 8,
    minHeight: 48,
    textAlign: 'center',
    lineHeight: 48,
  },
  selectedDatePreview: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
    textTransform: 'capitalize',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
  },
});

