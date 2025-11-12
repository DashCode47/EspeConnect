import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  Text,
  ScrollView,
  SafeAreaView,
  TextInput as RNTextInput,
  Modal,
  Platform,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EventStackParamList } from '../../navigation/types';
import { eventService, EventCategory } from '../../services/event.service';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'react-native-image-picker';
import { colors } from '../../config/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHideNavbar } from '../../hooks/useHideNavbar';
import { globalStyles } from '../../config/globalStyles';

type CreateEventScreenNavigationProp = NativeStackNavigationProp<EventStackParamList, 'CreateEvent'>;

export const CreateEventScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CreateEventScreenNavigationProp>();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState<EventCategory>(EventCategory.ACADEMIC);
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [ubicacion, setUbicacion] = useState('');
  const [precio, setPrecio] = useState('');
  const [image, setImage] = useState<{ uri: string; type?: string; fileName?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState({ hours: 9, minutes: 0 });
  const [tempEndDate, setTempEndDate] = useState(new Date());
  const [tempEndTime, setTempEndTime] = useState({ hours: 18, minutes: 0 });

  // Ocultar el navbar en esta pantalla
  useHideNavbar(true);

  const categories = [
    { key: EventCategory.ACADEMIC, label: 'Académico' },
    { key: EventCategory.SPORTS, label: 'Deportivo' },
    { key: EventCategory.SOCIAL, label: 'Social' },
    { key: EventCategory.PRIVATE, label: 'Privado' },
    { key: EventCategory.OTHER, label: 'Otro' },
  ];

  const handleImagePick = async () => {
    Alert.alert(
      'Seleccionar Imagen',
      '¿Desde dónde deseas seleccionar la imagen?',
      [
        {
          text: 'Galería',
          onPress: async () => {
            const result = await ImagePicker.launchImageLibrary({
              mediaType: 'photo',
              quality: 0.8,
            });

            if (result.assets && result.assets[0]?.uri) {
              const asset = result.assets[0];
              setImage({
                uri: asset.uri!,
                type: asset.type ?? 'image/jpeg',
                fileName: asset.fileName ?? `image_${Date.now()}.jpg`,
              });
            }
          },
        },
        {
          text: 'Cámara',
          onPress: async () => {
            const result = await ImagePicker.launchCamera({
              mediaType: 'photo',
              quality: 0.8,
            });

            if (result.assets && result.assets[0]?.uri) {
              const asset = result.assets[0];
              setImage({
                uri: asset.uri!,
                type: asset.type ?? 'image/jpeg',
                fileName: asset.fileName ?? `image_${Date.now()}.jpg`,
              });
            }
          },
        },
        { text: 'Cancelar', style: 'cancel' },
      ]
    );
  };

  const openDatePicker = () => {
    setTempDate(fechaInicio || new Date());
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    if (fechaInicio) {
      setTempTime({
        hours: fechaInicio.getHours(),
        minutes: fechaInicio.getMinutes(),
      });
    }
    setShowTimePicker(true);
  };

  const openEndDatePicker = () => {
    setTempEndDate(fechaFin || new Date());
    setShowEndDatePicker(true);
  };

  const openEndTimePicker = () => {
    if (fechaFin) {
      setTempEndTime({
        hours: fechaFin.getHours(),
        minutes: fechaFin.getMinutes(),
      });
    }
    setShowEndTimePicker(true);
  };

  const confirmDate = () => {
    const newDate = new Date(tempDate);
    newDate.setHours(tempTime.hours);
    newDate.setMinutes(tempTime.minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    setFechaInicio(newDate);
    setShowDatePicker(false);
  };

  const confirmTime = () => {
    if (fechaInicio) {
      const newDate = new Date(fechaInicio);
      newDate.setHours(tempTime.hours);
      newDate.setMinutes(tempTime.minutes);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      setFechaInicio(newDate);
    } else {
      const newDate = new Date();
      newDate.setHours(tempTime.hours);
      newDate.setMinutes(tempTime.minutes);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      setFechaInicio(newDate);
    }
    setShowTimePicker(false);
  };

  const confirmEndDate = () => {
    const newDate = new Date(tempEndDate);
    newDate.setHours(tempEndTime.hours);
    newDate.setMinutes(tempEndTime.minutes);
    newDate.setSeconds(0);
    newDate.setMilliseconds(0);
    setFechaFin(newDate);
    setShowEndDatePicker(false);
  };

  const confirmEndTime = () => {
    if (fechaFin) {
      const newDate = new Date(fechaFin);
      newDate.setHours(tempEndTime.hours);
      newDate.setMinutes(tempEndTime.minutes);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      setFechaFin(newDate);
    } else {
      const newDate = new Date();
      newDate.setHours(tempEndTime.hours);
      newDate.setMinutes(tempEndTime.minutes);
      newDate.setSeconds(0);
      newDate.setMilliseconds(0);
      setFechaFin(newDate);
    }
    setShowEndTimePicker(false);
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
    setTempTime((prev) => {
      let newHours = prev.hours + hours;
      if (newHours < 0) newHours = 23;
      if (newHours > 23) newHours = 0;
      return { ...prev, hours: newHours };
    });
  };

  const adjustMinute = (minutes: number) => {
    setTempTime((prev) => {
      let newMinutes = prev.minutes + minutes;
      if (newMinutes < 0) {
        newMinutes = 59;
        adjustHour(-1);
      }
      if (newMinutes > 59) {
        newMinutes = 0;
        adjustHour(1);
      }
      return { ...prev, minutes: newMinutes };
    });
  };

  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTimeDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre del evento es requerido');
      return;
    }
    if (!descripcion.trim()) {
      Alert.alert('Error', 'La descripción es requerida');
      return;
    }
    if (!fechaInicio) {
      Alert.alert('Error', 'La fecha de inicio es requerida');
      return;
    }
    if (!ubicacion.trim()) {
      Alert.alert('Error', 'La ubicación es requerida');
      return;
    }
    if (fechaFin && fechaFin <= fechaInicio) {
      Alert.alert('Error', 'La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('nombre', nombre.trim());
      formData.append('descripcion', descripcion.trim());
      formData.append('categoria', categoria);
      formData.append('fechaInicio', fechaInicio.toISOString());
      if(fechaFin) {
        formData.append('fechaFin', fechaFin.toISOString());
      }
      formData.append('ubicacion', ubicacion.trim());
      formData.append('precio', precio ? parseFloat(precio) : 0);
      if(image) {
        formData.append('image', {
          uri: image?.uri,
          type: image?.type || 'image/jpeg',
          name: image?.fileName,
        } as any);
      }
      await eventService.createEvent(formData as any);
      Alert.alert('Éxito', 'Evento creado exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'No se pudo crear el evento. Intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={28} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Nuevo Evento</Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Image Uploader */}
        <View style={styles.section}>
          <Text style={styles.label}>Imagen o Banner</Text>
          <TouchableOpacity
            style={styles.imageUploadContainer}
            onPress={handleImagePick}
            activeOpacity={0.8}>
            {image ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}>
                  <MaterialCommunityIcons name="close" size={20} color={colors.white} />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons
                  name="image-plus"
                  size={48}
                  color="#A0A0A0"
                />
                <Text style={styles.placeholderText}>Toca para subir una imagen</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Nombre del Evento</Text>
          <TextInput
            mode="outlined"
            placeholder="Ej: Conferencia de IA"
            value={nombre}
            onChangeText={setNombre}
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor={colors.primary}
          />
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Categoría</Text>
          <TouchableOpacity
            style={styles.selectContainer}
            onPress={() => {
              Alert.alert(
                'Seleccionar Categoría',
                '',
                [
                  ...categories.map((cat) => ({
                    text: cat.label,
                    onPress: () => setCategoria(cat.key),
                  })),
                  { text: 'Cancelar', style: 'cancel' },
                ]
              );
            }}>
            <Text
              style={[
                styles.selectText,
                !categoria && styles.selectPlaceholder,
              ]}>
              {categories.find((c) => c.key === categoria)?.label || 'Seleccionar categoría...'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Date & Time - Start */}
        <View style={styles.rowContainer}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Fecha Inicio</Text>
            <TouchableOpacity style={styles.dateTimeInput} onPress={openDatePicker}>
              <MaterialCommunityIcons name="calendar-month" size={24} color="#666" />
              <Text style={[styles.dateTimeText, !fechaInicio && styles.placeholderText]}>
                {fechaInicio ? formatDateDisplay(fechaInicio) : 'DD/MM/AAAA'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Hora Inicio</Text>
            <TouchableOpacity style={styles.dateTimeInput} onPress={openTimePicker}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#666" />
              <Text style={[styles.dateTimeText, !fechaInicio && styles.placeholderText]}>
                {fechaInicio ? formatTimeDisplay(fechaInicio) : 'HH:MM'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Date & Time - End (Optional) */}
        <View style={styles.rowContainer}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Fecha Fin (Opcional)</Text>
            <TouchableOpacity style={styles.dateTimeInput} onPress={openEndDatePicker}>
              <MaterialCommunityIcons name="calendar-month" size={24} color="#666" />
              <Text style={[styles.dateTimeText, !fechaFin && styles.placeholderText]}>
                {fechaFin ? formatDateDisplay(fechaFin) : 'DD/MM/AAAA'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Hora Fin (Opcional)</Text>
            <TouchableOpacity style={styles.dateTimeInput} onPress={openEndTimePicker}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#666" />
              <Text style={[styles.dateTimeText, !fechaFin && styles.placeholderText]}>
                {fechaFin ? formatTimeDisplay(fechaFin) : 'HH:MM'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Ubicación</Text>
          <View style={styles.locationInputWrapper}>
            <View style={styles.locationInputContainer}>
              <MaterialCommunityIcons name="map-marker" size={24} color="#666" />
              <RNTextInput
                style={styles.locationInput}
                placeholder="Ej: Auditorio Principal"
                placeholderTextColor="#A0A0A0"
                value={ubicacion}
                onChangeText={setUbicacion}
              />
            </View>
            <TouchableOpacity style={styles.mapButton}>
              <MaterialCommunityIcons name="map" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Precio (Opcional)</Text>
          <TextInput
            mode="outlined"
            placeholder="0.00"
            value={precio}
            onChangeText={setPrecio}
            keyboardType="decimal-pad"
            style={styles.input}
            outlineColor="#E0E0E0"
            activeOutlineColor={colors.primary}
            left={<TextInput.Icon icon="currency-usd" />}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Descripción detallada</Text>
          <TextInput
            mode="outlined"
            placeholder="Añade todos los detalles importantes sobre el evento aquí..."
            value={descripcion}
            onChangeText={setDescripcion}
            style={styles.textArea}
            multiline
            numberOfLines={6}
            outlineColor="#E0E0E0"
            activeOutlineColor={colors.primary}
          />
        </View>
      </ScrollView>

      {/* Bottom CTA Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
          contentStyle={styles.submitButtonContent}
          labelStyle={styles.submitButtonLabel}>
          Publicar Evento
        </Button>
      </View>

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
                      onPress={() => adjustMonth(-1)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempDate.toLocaleDateString('es-ES', { month: 'short' })}
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustMonth(1)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Año</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustMonth(-12)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>{tempDate.getFullYear()}</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustMonth(12)}>
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
              <Button mode="contained" onPress={confirmDate} style={styles.confirmButton}>
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
                      onPress={() => adjustHour(1)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempTime.hours.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustHour(-1)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Minutos</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustMinute(15)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempTime.minutes.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => adjustMinute(-15)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.selectedDatePreview}>
                <Text style={styles.selectedDateText}>
                  {tempTime.hours.toString().padStart(2, '0')}:
                  {tempTime.minutes.toString().padStart(2, '0')}
                </Text>
              </View>
              <Button mode="contained" onPress={confirmTime} style={styles.confirmButton}>
                Confirmar Hora
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* End Date Picker Modal */}
      <Modal
        visible={showEndDatePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEndDatePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Fecha Fin</Text>
              <TouchableOpacity
                onPress={() => setShowEndDatePicker(false)}
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
                      onPress={() => {
                        const newDate = new Date(tempEndDate);
                        newDate.setDate(newDate.getDate() - 1);
                        if (newDate >= new Date()) {
                          setTempEndDate(newDate);
                        }
                      }}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>{tempEndDate.getDate()}</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        const newDate = new Date(tempEndDate);
                        newDate.setDate(newDate.getDate() + 1);
                        setTempEndDate(newDate);
                      }}>
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
                        const newDate = new Date(tempEndDate);
                        newDate.setMonth(newDate.getMonth() - 1);
                        if (newDate >= new Date()) {
                          setTempEndDate(newDate);
                        }
                      }}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempEndDate.toLocaleDateString('es-ES', { month: 'short' })}
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        const newDate = new Date(tempEndDate);
                        newDate.setMonth(newDate.getMonth() + 1);
                        setTempEndDate(newDate);
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
                        const newDate = new Date(tempEndDate);
                        newDate.setMonth(newDate.getMonth() - 12);
                        if (newDate >= new Date()) {
                          setTempEndDate(newDate);
                        }
                      }}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>{tempEndDate.getFullYear()}</Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        const newDate = new Date(tempEndDate);
                        newDate.setMonth(newDate.getMonth() + 12);
                        setTempEndDate(newDate);
                      }}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.selectedDatePreview}>
                <Text style={styles.selectedDateText}>
                  {tempEndDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <Button mode="contained" onPress={confirmEndDate} style={styles.confirmButton}>
                Confirmar Fecha
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* End Time Picker Modal */}
      <Modal
        visible={showEndTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEndTimePicker(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Hora Fin</Text>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(false)}
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
                      onPress={() => {
                        setTempEndTime((prev) => {
                          let newHours = prev.hours + 1;
                          if (newHours > 23) newHours = 0;
                          return { ...prev, hours: newHours };
                        });
                      }}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempEndTime.hours.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        setTempEndTime((prev) => {
                          let newHours = prev.hours - 1;
                          if (newHours < 0) newHours = 23;
                          return { ...prev, hours: newHours };
                        });
                      }}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Minutos</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        setTempEndTime((prev) => {
                          let newMinutes = prev.minutes + 15;
                          if (newMinutes > 59) {
                            newMinutes = 0;
                            setTempEndTime((prev) => ({ ...prev, hours: (prev.hours + 1) % 24 }));
                          }
                          return { ...prev, minutes: newMinutes };
                        });
                      }}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempEndTime.minutes.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity
                      style={styles.pickerButton}
                      onPress={() => {
                        setTempEndTime((prev) => {
                          let newMinutes = prev.minutes - 15;
                          if (newMinutes < 0) {
                            newMinutes = 45;
                            setTempEndTime((prev) => ({ ...prev, hours: prev.hours === 0 ? 23 : prev.hours - 1 }));
                          }
                          return { ...prev, minutes: newMinutes };
                        });
                      }}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.selectedDatePreview}>
                <Text style={styles.selectedDateText}>
                  {tempEndTime.hours.toString().padStart(2, '0')}:
                  {tempEndTime.minutes.toString().padStart(2, '0')}
                </Text>
              </View>
              <Button mode="contained" onPress={confirmEndTime} style={styles.confirmButton}>
                Confirmar Hora
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingTop: globalStyles.screenHeight * 0.06,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.black,
    marginBottom: 8,
  },
  imageUploadContainer: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    minHeight: 160,
  },
  imagePlaceholder: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 9,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 56,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 56,
    paddingHorizontal: 16,
  },
  selectText: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  selectPlaceholder: {
    color: '#A0A0A0',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  dateTimeInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 56,
    paddingHorizontal: 16,
    gap: 12,
  },
  dateTimeText: {
    fontSize: 16,
    color: colors.black,
    flex: 1,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingLeft: 16,
    paddingRight: 12,
    height: 56,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: colors.black,
    height: '100%',
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.primary}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    minHeight: 144,
  },
  footer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
  },
  submitButtonContent: {
    height: 56,
  },
  submitButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E0E0E0',
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
  pickerButton: {
    padding: 8,
    minWidth: 48,
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

