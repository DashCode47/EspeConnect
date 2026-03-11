import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  TextInput,
  ScrollView,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'react-native-image-picker';
import { EventStackParamList } from '../../../../navigation/types';
import { useEventStore } from '../store/event.store';
import { EventCategory } from '../../domain/entities/event.entity';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { useHideNavbar } from '../../../../hooks/useHideNavbar';
import { FormInput } from '../../../../components/forms/FormInput';
import { FormTextArea } from '../../../../components/forms/FormTextArea';
import { SuccessModal } from '../../../../components/modals/SuccessModal';
import { ErrorModal } from '../../../../components/modals/ErrorModal';

type CreateEventScreenNavigationProp = NativeStackNavigationProp<EventStackParamList, 'CreateEvent'>;

const BACKGROUND_COLOR = '#F6F8F7';

const EVENT_CATEGORIES = [
  { key: EventCategory.ACADEMIC, label: 'Académico', emoji: '🎓' },
  { key: EventCategory.SPORTS,   label: 'Deportivo',  emoji: '⚽' },
  { key: EventCategory.SOCIAL,   label: 'Social',     emoji: '🎉' },
  { key: EventCategory.PRIVATE,  label: 'Privado',    emoji: '🔒' },
  { key: EventCategory.OTHER,    label: 'Otro',       emoji: '📌' },
];

export const CreateEventScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CreateEventScreenNavigationProp>();

  useHideNavbar(true);

  // ── Form state ──────────────────────────────────────────────────────────
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory]       = useState<EventCategory>(EventCategory.ACADEMIC);
  const [startTime, setStartTime]     = useState<Date | null>(null);
  const [endTime, setEndTime]         = useState<Date | null>(null);
  const [location, setLocation]       = useState('');
  const [price, setPrice]             = useState('');
  const [image, setImage]             = useState<{ uri: string; base64?: string; type?: string; fileName?: string } | null>(null);

  const { createEvent } = useEventStore();
  const [loading, setLoading]             = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModal, setErrorModal]       = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const showError = (message: string) => setErrorModal({ visible: true, message });

  // ── Sheet visibility ────────────────────────────────────────────────────
  const [showCategorySheet,  setShowCategorySheet]  = useState(false);
  const [showDatePicker,     setShowDatePicker]     = useState(false);
  const [showTimePicker,     setShowTimePicker]     = useState(false);
  const [showEndDatePicker,  setShowEndDatePicker]  = useState(false);
  const [showEndTimePicker,  setShowEndTimePicker]  = useState(false);

  // ── Temp picker state ───────────────────────────────────────────────────
  const [tempDate,    setTempDate]    = useState(new Date());
  const [tempTime,    setTempTime]    = useState({ hours: 9,  minutes: 0 });
  const [tempEndDate, setTempEndDate] = useState(new Date());
  const [tempEndTime, setTempEndTime] = useState({ hours: 18, minutes: 0 });

  // ── Image pick ──────────────────────────────────────────────────────────
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: true,
    });
    if (result.assets && result.assets[0]?.uri) {
      const asset = result.assets[0];
      setImage({
        uri: asset.uri!,
        base64: asset.base64 ?? undefined,
        type: asset.type ?? 'image/jpeg',
        fileName: asset.fileName ?? `image_${Date.now()}.jpg`,
      });
    }
  };

  // ── Picker openers ──────────────────────────────────────────────────────
  const openDatePicker = () => {
    setTempDate(startTime || new Date());
    setShowDatePicker(true);
  };
  const openTimePicker = () => {
    if (startTime) setTempTime({ hours: startTime.getHours(), minutes: startTime.getMinutes() });
    setShowTimePicker(true);
  };
  const openEndDatePicker = () => {
    setTempEndDate(endTime || new Date());
    setShowEndDatePicker(true);
  };
  const openEndTimePicker = () => {
    if (endTime) setTempEndTime({ hours: endTime.getHours(), minutes: endTime.getMinutes() });
    setShowEndTimePicker(true);
  };

  // ── Adjust helpers ──────────────────────────────────────────────────────
  const adjustDate = (days: number) => {
    const d = new Date(tempDate);
    d.setDate(d.getDate() + days);
    if (d >= new Date()) setTempDate(d);
  };
  const adjustMonth = (months: number) => {
    const d = new Date(tempDate);
    d.setMonth(d.getMonth() + months);
    if (d >= new Date()) setTempDate(d);
  };
  const adjustHour = (delta: number) => {
    setTempTime(prev => {
      let h = prev.hours + delta;
      if (h < 0) h = 23;
      if (h > 23) h = 0;
      return { ...prev, hours: h };
    });
  };
  const adjustMinute = (delta: number) => {
    setTempTime(prev => {
      let m = prev.minutes + delta;
      if (m < 0) m = 45;
      if (m > 59) m = 0;
      return { ...prev, minutes: m };
    });
  };
  const adjustEndDate = (days: number) => {
    const d = new Date(tempEndDate);
    d.setDate(d.getDate() + days);
    if (d >= new Date()) setTempEndDate(d);
  };
  const adjustEndMonth = (months: number) => {
    const d = new Date(tempEndDate);
    d.setMonth(d.getMonth() + months);
    if (d >= new Date()) setTempEndDate(d);
  };

  // ── Confirm helpers ─────────────────────────────────────────────────────
  const confirmDate = () => {
    const d = new Date(tempDate);
    d.setHours(tempTime.hours, tempTime.minutes, 0, 0);
    setStartTime(d);
    setShowDatePicker(false);
  };
  const confirmTime = () => {
    const base = startTime ? new Date(startTime) : new Date();
    base.setHours(tempTime.hours, tempTime.minutes, 0, 0);
    setStartTime(base);
    setShowTimePicker(false);
  };
  const confirmEndDate = () => {
    const d = new Date(tempEndDate);
    d.setHours(tempEndTime.hours, tempEndTime.minutes, 0, 0);
    setEndTime(d);
    setShowEndDatePicker(false);
  };
  const confirmEndTime = () => {
    const base = endTime ? new Date(endTime) : new Date();
    base.setHours(tempEndTime.hours, tempEndTime.minutes, 0, 0);
    setEndTime(base);
    setShowEndTimePicker(false);
  };

  // ── Display helpers ─────────────────────────────────────────────────────
  const formatDateDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };
  const formatTimeDisplay = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };
  const getCategoryLabel = (cat: EventCategory) =>
    EVENT_CATEGORIES.find(c => c.key === cat)?.label ?? '';
  const getCategoryEmoji = (cat: EventCategory) =>
    EVENT_CATEGORIES.find(c => c.key === cat)?.emoji ?? '';

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!title.trim())       { showError('El nombre del evento es requerido'); return; }
    if (!description.trim()) { showError('La descripción es requerida'); return; }
    if (!startTime)          { showError('La fecha de inicio es requerida'); return; }
    if (!location.trim())    { showError('La ubicación es requerida'); return; }
    if (endTime && endTime <= startTime) {
      showError('La fecha de fin debe ser posterior a la fecha de inicio');
      return;
    }
    try {
      setLoading(true);
      const success = await createEvent({
        title: title.trim(),
        description: description.trim(),
        category,
        startTime: startTime.toISOString(),
        endTime: endTime?.toISOString() || null,
        location: location.trim(),
        price: price ? parseFloat(price) : 0,
        image,
      });
      if (success) {
        setShowSuccessModal(true);
      } else {
        showError('No se pudo crear el evento. Intenta nuevamente.');
      }
    } catch {
      showError('Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reusable picker column renderers ────────────────────────────────────
  const renderDateColumns = (
    date: Date,
    onAdjustDay: (d: number) => void,
    onAdjustMonth: (m: number) => void,
  ) => (
    <View style={styles.pickerRow}>
      {[
        { label: 'Día',  value: String(date.getDate()), up: () => onAdjustDay(1),    down: () => onAdjustDay(-1) },
        { label: 'Mes',  value: date.toLocaleDateString('es-ES', { month: 'short' }), up: () => onAdjustMonth(1), down: () => onAdjustMonth(-1) },
        { label: 'Año',  value: String(date.getFullYear()), up: () => onAdjustMonth(12), down: () => onAdjustMonth(-12) },
      ].map(col => (
        <View key={col.label} style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>{col.label}</Text>
          <View style={styles.pickerControls}>
            <TouchableOpacity style={styles.pickerButton} onPress={col.up}>
              <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.pickerValue}>{col.value}</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={col.down}>
              <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderTimeColumns = (
    time: { hours: number; minutes: number },
    onHour: (d: number) => void,
    onMinute: (d: number) => void,
  ) => (
    <View style={styles.pickerRow}>
      {[
        { label: 'Hora',    value: time.hours.toString().padStart(2, '0'),   up: () => onHour(1),    down: () => onHour(-1) },
        { label: 'Minutos', value: time.minutes.toString().padStart(2, '0'), up: () => onMinute(15), down: () => onMinute(-15) },
      ].map(col => (
        <View key={col.label} style={styles.pickerColumn}>
          <Text style={styles.pickerLabel}>{col.label}</Text>
          <View style={styles.pickerControls}>
            <TouchableOpacity style={styles.pickerButton} onPress={col.up}>
              <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.pickerValue}>{col.value}</Text>
            <TouchableOpacity style={styles.pickerButton} onPress={col.down}>
              <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safeArea}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Crear Nuevo Evento</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Image upload */}
        <View style={styles.fieldSpacing}>
          <Text style={styles.fieldLabel}>Imagen o Banner</Text>
          <TouchableOpacity
            style={styles.imageUploadContainer}
            onPress={handleImagePick}
            activeOpacity={0.8}>
            {image ? (
              <>
                <Image source={{ uri: image.uri }} style={styles.previewImage} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setImage(null)}>
                  <MaterialCommunityIcons name="close" size={20} color={colors.white} />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialCommunityIcons name="image-plus" size={48} color={`${colors.primary}66`} />
                <Text style={styles.imagePlaceholderText}>Toca para subir una imagen</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Title */}
        <FormInput
          label="Nombre del Evento"
          placeholder="Ej: Conferencia de IA"
          value={title}
          onChangeText={setTitle}
          containerStyle={styles.fieldSpacing}
        />

        {/* Category */}
        <View style={styles.fieldSpacing}>
          <Text style={styles.fieldLabel}>Categoría</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategorySheet(true)}
            activeOpacity={0.7}>
            <Text style={[styles.selectText, !category && styles.selectPlaceholder]}>
              {category
                ? `${getCategoryEmoji(category)} ${getCategoryLabel(category)}`
                : 'Selecciona una categoría'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Description */}
        <FormTextArea
          label="Descripción detallada"
          placeholder="Añade todos los detalles importantes sobre el evento aquí..."
          value={description}
          onChangeText={setDescription}
          numberOfLines={4}
          containerStyle={styles.fieldSpacing}
        />

        {/* Start date & time */}
        <View style={[styles.rowContainer, styles.fieldSpacing]}>
          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Fecha Inicio</Text>
            <TouchableOpacity style={styles.dateTimeButton} onPress={openDatePicker}>
              <MaterialCommunityIcons name="calendar-month" size={20} color="#6B7280" />
              <Text style={[styles.dateTimeText, !startTime && styles.selectPlaceholder]}>
                {startTime ? formatDateDisplay(startTime) : 'DD/MM/AAAA'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Hora Inicio</Text>
            <TouchableOpacity style={styles.dateTimeButton} onPress={openTimePicker}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
              <Text style={[styles.dateTimeText, !startTime && styles.selectPlaceholder]}>
                {startTime ? formatTimeDisplay(startTime) : 'HH:MM'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* End date & time */}
        <View style={[styles.rowContainer, styles.fieldSpacing]}>
          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Fecha Fin (Opc.)</Text>
            <TouchableOpacity style={styles.dateTimeButton} onPress={openEndDatePicker}>
              <MaterialCommunityIcons name="calendar-month" size={20} color="#6B7280" />
              <Text style={[styles.dateTimeText, !endTime && styles.selectPlaceholder]}>
                {endTime ? formatDateDisplay(endTime) : 'DD/MM/AAAA'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Hora Fin (Opc.)</Text>
            <TouchableOpacity style={styles.dateTimeButton} onPress={openEndTimePicker}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
              <Text style={[styles.dateTimeText, !endTime && styles.selectPlaceholder]}>
                {endTime ? formatTimeDisplay(endTime) : 'HH:MM'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <FormInput
          label="Ubicación"
          placeholder="Ej: Auditorio Principal"
          value={location}
          onChangeText={setLocation}
          leftIcon="map-marker"
          containerStyle={styles.fieldSpacing}
        />

        {/* Price */}
        <View style={styles.fieldSpacing}>
          <Text style={styles.fieldLabel}>Precio (Opcional)</Text>
          <View style={styles.priceContainer}>
            <View style={styles.currencyBadge}>
              <Text style={styles.currencyText}>USD</Text>
            </View>
            <View style={styles.priceInputWrapper}>
              <Text style={styles.pricePrefix}>$</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                value={price}
                onChangeText={(text) => {
                  const cleaned = text.replace(/[^0-9.]/g, '');
                  const parts = cleaned.split('.');
                  if (parts.length > 2) return;
                  if (parts[1] && parts[1].length > 2) return;
                  setPrice(cleaned);
                }}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}>
          <Text style={styles.submitButtonText}>
            {loading ? 'Publicando...' : 'Publicar Evento'}
          </Text>
          {!loading && (
            <MaterialCommunityIcons name="rocket-launch" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Category sheet */}
      {showCategorySheet && (
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setShowCategorySheet(false)}>
          <TouchableOpacity style={styles.sheetContent} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Categoría</Text>
              <TouchableOpacity onPress={() => setShowCategorySheet(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            {EVENT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={styles.sheetOption}
                onPress={() => { setCategory(cat.key); setShowCategorySheet(false); }}>
                <Text style={styles.sheetOptionText}>{cat.emoji}{'  '}{cat.label}</Text>
                {category === cat.key && (
                  <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Start date sheet */}
      {showDatePicker && (
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setShowDatePicker(false)}>
          <TouchableOpacity style={styles.sheetContent} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Seleccionar Fecha</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              {renderDateColumns(tempDate, adjustDate, adjustMonth)}
              <View style={styles.selectedPreview}>
                <Text style={styles.selectedPreviewText}>
                  {tempDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </View>
              <TouchableOpacity style={styles.confirmPickerButton} onPress={confirmDate}>
                <Text style={styles.confirmPickerButtonText}>Confirmar Fecha</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* Start time sheet */}
      {showTimePicker && (
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setShowTimePicker(false)}>
          <TouchableOpacity style={styles.sheetContent} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Seleccionar Hora</Text>
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              {renderTimeColumns(tempTime, adjustHour, adjustMinute)}
              <View style={styles.selectedPreview}>
                <Text style={styles.selectedPreviewText}>
                  {tempTime.hours.toString().padStart(2, '0')}:{tempTime.minutes.toString().padStart(2, '0')}
                </Text>
              </View>
              <TouchableOpacity style={styles.confirmPickerButton} onPress={confirmTime}>
                <Text style={styles.confirmPickerButtonText}>Confirmar Hora</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* End date sheet */}
      {showEndDatePicker && (
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setShowEndDatePicker(false)}>
          <TouchableOpacity style={styles.sheetContent} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Seleccionar Fecha Fin</Text>
              <TouchableOpacity onPress={() => setShowEndDatePicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              {renderDateColumns(tempEndDate, adjustEndDate, adjustEndMonth)}
              <View style={styles.selectedPreview}>
                <Text style={styles.selectedPreviewText}>
                  {tempEndDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </View>
              <TouchableOpacity style={styles.confirmPickerButton} onPress={confirmEndDate}>
                <Text style={styles.confirmPickerButtonText}>Confirmar Fecha</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      {/* End time sheet */}
      {showEndTimePicker && (
        <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={() => setShowEndTimePicker(false)}>
          <TouchableOpacity style={styles.sheetContent} activeOpacity={1}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Seleccionar Hora Fin</Text>
              <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.primaryDark} />
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              {renderTimeColumns(
                tempEndTime,
                (delta) => setTempEndTime(prev => {
                  let h = prev.hours + delta;
                  if (h < 0) h = 23;
                  if (h > 23) h = 0;
                  return { ...prev, hours: h };
                }),
                (delta) => setTempEndTime(prev => {
                  let m = prev.minutes + delta;
                  if (m < 0) m = 45;
                  if (m > 59) m = 0;
                  return { ...prev, minutes: m };
                }),
              )}
              <View style={styles.selectedPreview}>
                <Text style={styles.selectedPreviewText}>
                  {tempEndTime.hours.toString().padStart(2, '0')}:{tempEndTime.minutes.toString().padStart(2, '0')}
                </Text>
              </View>
              <TouchableOpacity style={styles.confirmPickerButton} onPress={confirmEndTime}>
                <Text style={styles.confirmPickerButtonText}>Confirmar Hora</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <ErrorModal
        visible={errorModal.visible}
        message={errorModal.message}
        onClose={() => setErrorModal({ visible: false, message: '' })}
      />

      <SuccessModal
        visible={showSuccessModal}
        title="¡Solicitud enviada!"
        message="Tu evento ha sido enviado correctamente. Un administrador revisará y aprobará su publicación en breve."
        buttonText="Entendido"
        icon="clock-check-outline"
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_COLOR,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: `${BACKGROUND_COLOR}F2`,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 90, 57, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Fields
  fieldSpacing: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: 8,
    marginBottom: 8,
  },

  // Image upload
  imageUploadContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(16, 90, 57, 0.15)',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    minHeight: 180,
  },
  imagePlaceholder: {
    flex: 1,
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  imagePlaceholderText: {
    fontSize: 13,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: `${colors.primary}66`,
  },
  previewImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Select buttons
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  selectText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#1F2937',
    flex: 1,
  },
  selectPlaceholder: {
    color: '#9CA3AF',
  },

  // Date & time row
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  dateTimeText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#1F2937',
    flex: 1,
  },

  // Price
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  currencyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRightWidth: 2,
    borderRightColor: 'rgba(16, 90, 57, 0.1)',
    backgroundColor: 'rgba(16, 90, 57, 0.04)',
  },
  currencyText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  priceInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
  },
  pricePrefix: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#9CA3AF',
  },
  priceInput: {
    flex: 1,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 15,
    color: '#1F2937',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },

  // Bottom CTA
  bottomCta: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },

  // Bottom sheet (shared by all sheets)
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheetContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  sheetOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  sheetOptionText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#1F2937',
  },

  // Picker columns (inside date/time sheets)
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
    fontSize: 12,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
    fontSize: 28,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
    marginVertical: 8,
    minHeight: 40,
    textAlign: 'center',
    lineHeight: 40,
  },
  selectedPreview: {
    backgroundColor: '#F5F5F5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedPreviewText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    color: colors.primaryDark,
    textTransform: 'capitalize',
  },
  confirmPickerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmPickerButtonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#FFFFFF',
  },
});
