import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Text,
  TextInput,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { tripService, CreateTripData } from '../../services/trip.service';
import { colors } from '../../config/colors';
import { UbicacionActual } from '../../assets/svg/UbicacionActual';
import { Destino } from '../../assets/svg/Destino';
import { RideStackParamList } from '../../navigation/types';
import { useHideNavbar } from '../../hooks/useHideNavbar';
import { globalStyles } from '../../config/globalStyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { SuccessModal } from '../../components/modals/SuccessModal';
import { ErrorModal } from '../../components/modals/ErrorModal';

type CreateTripScreenNavigationProp = NativeStackNavigationProp<RideStackParamList, 'CreateTrip'>;

export const CreateTripScreen = () => {
  const navigation = useNavigation<CreateTripScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { profile } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateTripData>({
    origin: '',
    destination: '',
    departureTime: new Date().toISOString(),
    availableSeats: 0,
    price: undefined,
    notes: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSeatsPicker, setShowSeatsPicker] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date(formData.departureTime));
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState('0.00');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdTripId, setCreatedTripId] = useState<string | null>(null);
  
  useHideNavbar(true);

  const handleInputChange = (field: keyof CreateTripData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openDatePicker = () => {
    setTempDate(new Date(formData.departureTime));
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    setTempDate(new Date(formData.departureTime));
    setShowTimePicker(true);
  };

  const confirmDate = () => {
    const newDateTime = new Date(tempDate);
    const currentTime = new Date(formData.departureTime);
    newDateTime.setHours(currentTime.getHours());
    newDateTime.setMinutes(currentTime.getMinutes());
    handleInputChange('departureTime', newDateTime.toISOString());
    setShowDatePicker(false);
  };

  const confirmTime = () => {
    const newDateTime = new Date(formData.departureTime);
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

  const adjustSeats = (seats: number) => {
    const newSeats = formData.availableSeats + seats;
    if (newSeats >= 0 && newSeats <= 10) {
      handleInputChange('availableSeats', newSeats);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const validateForm = (): boolean => {
    if (!formData.origin.trim()) {
      setErrorMessage('El origen es requerido');
      setShowErrorModal(true);
      return false;
    }
    if (!formData.destination.trim()) {
      setErrorMessage('El destino es requerido');
      setShowErrorModal(true);
      return false;
    }
    if (formData.availableSeats < 1) {
      setErrorMessage('Debe haber al menos 1 asiento disponible');
      setShowErrorModal(true);
      return false;
    }
    const departureDate = new Date(formData.departureTime);
    const now = new Date();
    if (departureDate <= now) {
      setErrorMessage('La fecha y hora de salida debe ser en el futuro');
      setShowErrorModal(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await tripService.createTrip({
        ...formData,
        notes: formData.notes || undefined,
        price: priceValue && parseFloat(priceValue) > 0 ? parseFloat(priceValue) : undefined,
      });
      setCreatedTripId(response.data.trip.id);
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Error creating trip:', error);
      setErrorMessage(
        error.response?.data?.message || 'No se pudo crear el viaje. Intenta nuevamente.'
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Crear viaje</Text>
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

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: globalStyles.getBottomSafeArea(insets) + 20 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          
          {/* User Info */}
          <View style={styles.userSection}>
            {profile?.avatarUrl ? (
              <Image source={{ uri: profile.avatarUrl }} style={styles.userAvatar} />
            ) : (
              <View style={styles.userAvatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={20} color={colors.primary} />
              </View>
            )}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile?.name || 'Nombre Apellido'}</Text>
              <Text style={styles.userCareer}>{profile?.career || 'Carrera'}</Text>
            </View>
          </View>

          {/* Location Card */}
          <View style={styles.locationCard}>
            <View style={styles.locationField}>
              <UbicacionActual color={colors.primary} size={20} />
              <TextInput
                style={styles.locationInput}
                placeholder="Ubicación actual"
                placeholderTextColor="#999"
                value={formData.origin}
                onChangeText={(text) => handleInputChange('origin', text)}
              />
            </View>
            <View style={styles.locationConnector} />
            <View style={styles.locationField}>
              <Destino color={colors.primary} size={20} />
              <TextInput
                style={styles.locationInput}
                placeholder="Universidad"
                placeholderTextColor={colors.primary}
                value={formData.destination}
                onChangeText={(text) => handleInputChange('destination', text)}
              />
            </View>
          </View>

          {/* Map Section */}
          <View style={styles.mapSection}>
            <View style={styles.mapSectionHeader}>
              <Text style={styles.mapSectionTitle}>Tu ubicación</Text>
              <TouchableOpacity>
                <MaterialCommunityIcons name="fullscreen" size={20} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.mapPlaceholder}>
              <MaterialCommunityIcons name="map" size={48} color="#ccc" />
              <Text style={styles.mapPlaceholderText}>Mapa</Text>
            </View>
            <View style={styles.mapInfo}>
              <Text style={styles.mapInfoText}>Duración aproximada: 30m</Text>
              <Text style={styles.mapInfoText}>Distancia: 100m</Text>
            </View>
          </View>

          {/* Schedule Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Horario</Text>
            
            {/* Date Field */}
            <TouchableOpacity
              style={styles.pickerField}
              onPress={openDatePicker}
              activeOpacity={0.7}>
              <MaterialCommunityIcons name="calendar" size={20} color="#999" />
              <View style={styles.pickerFieldContent}>
                <Text style={styles.pickerFieldLabel}>Selecciona una fecha</Text>
                <Text style={styles.pickerFieldValue}>
                  {formatDate(new Date(formData.departureTime)) || '00/00/0000'}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={showDatePicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>

            {/* Time Field */}
            <TouchableOpacity
              style={styles.pickerField}
              onPress={openTimePicker}
              activeOpacity={0.7}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#999" />
              <View style={styles.pickerFieldContent}>
                <Text style={styles.pickerFieldLabel}>Selecciona una hora de salida</Text>
                <Text style={styles.pickerFieldValue}>
                  {formatTime(new Date(formData.departureTime)) || '00:00'}
                </Text>
              </View>
              <MaterialCommunityIcons
                name={showTimePicker ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#999"
              />
            </TouchableOpacity>
          </View>

          {/* Passengers Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pasajeros</Text>
            <TouchableOpacity
              style={styles.pickerField}
              onPress={() => setShowSeatsPicker(true)}
              activeOpacity={0.7}>
              <MaterialCommunityIcons name="account" size={20} color="#999" />
              <View style={styles.pickerFieldContent}>
                <Text style={styles.pickerFieldLabel}>Seleccione los cupos</Text>
                <Text style={styles.pickerFieldValue}>{formData.availableSeats}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Price Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Precio</Text>
            <View style={styles.priceField}>
              <View style={styles.priceCurrency}>
                <Text style={styles.currencyText}>USD</Text>
                <View style={styles.priceSeparator} />
              </View>
              <TextInput
                style={styles.priceInput}
                placeholder="$ 0.00"
                placeholderTextColor="#999"
                value={priceValue}
                onChangeText={(text) => {
                  setPriceValue(text);
                  const numValue = parseFloat(text);
                  if (!isNaN(numValue)) {
                    handleInputChange('price', numValue);
                  }
                }}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Payment Methods Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métodos de pago permitidos</Text>
            <TouchableOpacity
              style={styles.pickerField}
              onPress={() => setShowPaymentPicker(true)}
              activeOpacity={0.7}>
              <MaterialCommunityIcons name="cash" size={20} color="#999" />
              <View style={styles.pickerFieldContent}>
                <Text style={styles.pickerFieldLabel}>
                  Seleccione como desea recibir el pago
                </Text>
                <Text style={styles.pickerFieldValue}>
                  {selectedPaymentMethod || 'Sin seleccionar'}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-down" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleSubmit}
              disabled={loading}>
              <Text style={styles.createButtonText}>
                {loading ? 'Creando...' : 'Crear viaje'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Fecha</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.modalCloseButton}>
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
                      onPress={() => adjustDate(-1)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>{tempDate.getDate()}</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustDate(1)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Mes</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        const newDate = new Date(tempDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        if (newDate >= new Date()) {
                          setTempDate(newDate);
                        }
                      }}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempDate.toLocaleDateString('es-ES', { month: 'short' })}
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        const newDate = new Date(tempDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setTempDate(newDate);
                      }}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Año</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        const newDate = new Date(tempDate);
                        newDate.setFullYear(newDate.getFullYear() - 1);
                        if (newDate >= new Date()) {
                          setTempDate(newDate);
                        }
                      }}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>{tempDate.getFullYear()}</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        const newDate = new Date(tempDate);
                        newDate.setFullYear(newDate.getFullYear() + 1);
                        setTempDate(newDate);
                      }}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmDate}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Hora</Text>
              <TouchableOpacity
                onPress={() => setShowTimePicker(false)}
                style={styles.modalCloseButton}>
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
                      onPress={() => adjustHour(-1)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempDate.getHours().toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustHour(1)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Minutos</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustMinute(-1)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempDate.getMinutes().toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustMinute(1)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmTime}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Seats Picker Modal */}
      <Modal
        visible={showSeatsPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSeatsPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Cupos</Text>
              <TouchableOpacity
                onPress={() => setShowSeatsPicker(false)}
                style={styles.modalCloseButton}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerRow}>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Cupos</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustSeats(-1)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>{formData.availableSeats}</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustSeats(1)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.modalConfirmButton}
                onPress={() => setShowSeatsPicker(false)}>
                <Text style={styles.modalConfirmText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Method Picker Modal */}
      <Modal
        visible={showPaymentPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentPicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Método de Pago</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentPicker(false)}
                style={styles.modalCloseButton}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              {['Efectivo', 'Transferencia', 'Ambos'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentOption,
                    selectedPaymentMethod === method && styles.paymentOptionSelected,
                  ]}
                  onPress={() => {
                    setSelectedPaymentMethod(method);
                    setShowPaymentPicker(false);
                  }}>
                  <Text
                    style={[
                      styles.paymentOptionText,
                      selectedPaymentMethod === method && styles.paymentOptionTextSelected,
                    ]}>
                    {method}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>

      {/* Success and Error Modals */}
      <SuccessModal
        visible={showSuccessModal}
        title="¡Viaje Creado!"
        message="Tu viaje ha sido creado exitosamente y ya está disponible para otros usuarios."
        onClose={() => {
          setShowSuccessModal(false);
          if (createdTripId) {
            navigation.navigate('TripDetail', { tripId: createdTripId });
          } else {
            navigation.goBack();
          }
        }}
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
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
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
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userAvatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 2,
  },
  userCareer: {
    fontSize: 14,
    color: '#999',
  },
  locationCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.primary,
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
    left: 20,
    top: 42,
    width: 2,
    height: 20,
    backgroundColor: colors.primary,
    zIndex: 0,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: colors.primaryDark,
  },
  mapSection: {
    marginBottom: 24,
  },
  mapSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  mapInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
  },
  mapInfoText: {
    fontSize: 14,
    color: colors.primaryDark,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
  },
  pickerField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    gap: 12,
  },
  pickerFieldContent: {
    flex: 1,
  },
  pickerFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primaryDark,
    marginBottom: 4,
  },
  pickerFieldValue: {
    fontSize: 14,
    color: '#999',
  },
  priceField: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    overflow: 'hidden',
  },
  priceCurrency: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
  },
  currencyText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryDark,
  },
  priceSeparator: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 12,
  },
  priceInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.primaryDark,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.success,
  },
  createButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
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
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  modalCloseButton: {
    paddingVertical: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  pickerContainer: {
    paddingVertical: 20,
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  pickerColumn: {
    alignItems: 'center',
  },
  pickerLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 12,
  },
  pickerControls: {
    alignItems: 'center',
    gap: 8,
  },
  pickerButton: {
    padding: 8,
  },
  pickerValue: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primaryDark,
    minWidth: 60,
    textAlign: 'center',
  },
  modalConfirmButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  paymentOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 12,
  },
  paymentOptionSelected: {
    backgroundColor: colors.primary,
  },
  paymentOptionText: {
    fontSize: 16,
    color: colors.primaryDark,
  },
  paymentOptionTextSelected: {
    color: colors.white,
  },
});
