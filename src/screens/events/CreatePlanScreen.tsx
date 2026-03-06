import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { EventStackParamList } from '../../navigation/types';
import { PlanCategory } from '../../types/plan.types';
import { planService } from '../../services/plan.service';
import { colors } from '../../config/colors';
import { globalStyles, FONT_FAMILY } from '../../config/globalStyles';
import { useHideNavbar } from '../../hooks/useHideNavbar';
import { FormInput } from '../../components/forms/FormInput';
import { FormTextArea } from '../../components/forms/FormTextArea';
import {
  CategoryPickerModal,
  getCategoryLabel,
  getCategoryEmoji,
} from '../../components/forms/CategoryPickerModal';
import { ParticipantCounter } from '../../components/forms/ParticipantCounter';

type CreatePlanNavigationProp = NativeStackNavigationProp<EventStackParamList, 'CreatePlan'>;

export const CreatePlanScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<CreatePlanNavigationProp>();
  useHideNavbar(true);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlanCategory | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<{ hours: number; minutes: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(5);
  const [manualApproval, setManualApproval] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  // Temp picker state
  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState({ hours: 9, minutes: 0 });

  // Toggle animation
  const toggleAnim = useRef(new Animated.Value(0)).current;

  const toggleManualApproval = () => {
    const toValue = manualApproval ? 0 : 1;
    Animated.spring(toggleAnim, {
      toValue,
      useNativeDriver: false,
      friction: 8,
      tension: 60,
    }).start();
    setManualApproval(!manualApproval);
  };

  const toggleTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const toggleBgColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#D1D5DB', colors.accent],
  });

  // Date picker helpers
  const openDatePicker = () => {
    setTempDate(date || new Date());
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    setTempTime(startTime || { hours: 9, minutes: 0 });
    setShowTimePicker(true);
  };

  const adjustDate = (days: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(newDate.getDate() + days);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate >= today) {
      setTempDate(newDate);
    }
  };

  const adjustMonth = (months: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(newDate.getMonth() + months);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate >= today) {
      setTempDate(newDate);
    }
  };

  const confirmDate = () => {
    setDate(new Date(tempDate));
    setShowDatePicker(false);
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
      if (m < 0) {
        m = 45;
      }
      if (m > 59) {
        m = 0;
      }
      return { ...prev, minutes: m };
    });
  };

  const confirmTime = () => {
    setStartTime({ ...tempTime });
    setShowTimePicker(false);
  };

  const formatDateDisplay = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatTimeDisplay = (t: { hours: number; minutes: number } | null) => {
    if (!t) return '';
    return `${t.hours.toString().padStart(2, '0')}:${t.minutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título del plan es requerido');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }
    if (!date) {
      Alert.alert('Error', 'La fecha es requerida');
      return;
    }
    if (!startTime) {
      Alert.alert('Error', 'La hora es requerida');
      return;
    }

    try {
      setLoading(true);
      const dateStr = date.toISOString().split('T')[0];
      const timeStr = formatTimeDisplay(startTime);

      await planService.createPlan({
        title: title.trim(),
        description: description.trim() || undefined,
        category,
        date: dateStr,
        start_time: timeStr,
        location_name: locationName.trim() || undefined,
        max_participants: maxParticipants,
      });

      Alert.alert('Plan creado', 'Tu plan ha sido publicado exitosamente', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.message || 'No se pudo crear el plan. Intenta nuevamente.',
      );
    } finally {
      setLoading(false);
    }
  };

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
        <Text style={styles.headerTitle}>Crear Nuevo Plan Estudiantil</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* XP Challenge Banner */}
        {/* <View style={styles.challengeBanner}>
          <View style={styles.challengeIconWrapper}>
            <View style={styles.challengeIcon}>
              <MaterialCommunityIcons name="trophy-award" size={36} color={colors.accent} />
            </View>
            <View style={styles.xpBadge}>
              <Text style={styles.xpText}>+50XP</Text>
            </View>
          </View>
          <View style={styles.challengeTextWrapper}>
            <Text style={styles.challengeTitle}>Desafío Social Starter</Text>
            <Text style={styles.challengeDescription}>
              ¡Crea tu primer plan y obtén tu insignia de organizador!
            </Text>
          </View>
        </View> */}

        {/* Title */}
        <FormInput
          label="Título del Plan"
          placeholder="Ej: Café después de clases ☕"
          value={title}
          onChangeText={setTitle}
          containerStyle={styles.fieldSpacing}
        />

        {/* Category */}
        <View style={styles.fieldSpacing}>
          <Text style={styles.fieldLabel}>Categoría</Text>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowCategoryModal(true)}
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
          label="Descripción"
          placeholder="¿De qué trata el plan? Cuéntanos los detalles..."
          value={description}
          onChangeText={setDescription}
          numberOfLines={3}
          containerStyle={styles.fieldSpacing}
        />

        {/* Date & Time Row */}
        <View style={[styles.rowContainer, styles.fieldSpacing]}>
          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Fecha</Text>
            <TouchableOpacity style={styles.dateTimeButton} onPress={openDatePicker}>
              <MaterialCommunityIcons name="calendar-month" size={20} color="#6B7280" />
              <Text style={[styles.dateTimeText, !date && styles.selectPlaceholder]}>
                {date ? formatDateDisplay(date) : 'DD/MM/AAAA'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.halfWidth}>
            <Text style={styles.fieldLabel}>Hora</Text>
            <TouchableOpacity style={styles.dateTimeButton} onPress={openTimePicker}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#6B7280" />
              <Text style={[styles.dateTimeText, !startTime && styles.selectPlaceholder]}>
                {startTime ? formatTimeDisplay(startTime) : 'HH:MM'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Location */}
        <FormInput
          label="Ubicación"
          placeholder="Ej: Biblioteca central o Sala 4"
          value={locationName}
          onChangeText={setLocationName}
          leftIcon="map-marker"
          containerStyle={styles.fieldSpacing}
        />

        {/* Participant Counter */}
        <View style={styles.fieldSpacing}>
          <ParticipantCounter
            label="Número de participantes"
            value={maxParticipants}
            onChange={setMaxParticipants}
            min={2}
            max={50}
          />
        </View>

        {/* Manual Approval Section */}
        <View style={[styles.approvalSection, styles.fieldSpacing]}>
          <View style={styles.approvalRow}>
            <View style={styles.approvalTextWrapper}>
              <Text style={styles.approvalTitle}>Aprobación manual</Text>
              <Text style={styles.approvalSubtitle}>
                Tú decides quién se une al plan
              </Text>
            </View>
            <TouchableOpacity
              onPress={toggleManualApproval}
              activeOpacity={0.8}
              style={styles.toggleTouchArea}>
              <Animated.View
                style={[styles.toggleTrack, { backgroundColor: toggleBgColor }]}>
                <Animated.View
                  style={[
                    styles.toggleThumb,
                    { transform: [{ translateX: toggleTranslateX }] },
                  ]}
                />
              </Animated.View>
            </TouchableOpacity>
          </View>

          <View style={styles.infoBox}>
            <MaterialCommunityIcons
              name="information-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Como creador, podrás aceptar o remover participantes desde la lista
              de asistentes una vez publicado el plan.
            </Text>
          </View>

          {manualApproval && (
            <TouchableOpacity style={styles.manageButton} activeOpacity={0.7}>
              <MaterialCommunityIcons name="cog-outline" size={20} color={colors.primary} />
              <Text style={styles.manageButtonText}>Gestionar Participantes</Text>
            </TouchableOpacity>
          )}
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
            {loading ? 'Publicando...' : 'Publicar Plan'}
          </Text>
          {!loading && (
            <MaterialCommunityIcons name="rocket-launch" size={22} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Category Picker Modal */}
      <CategoryPickerModal
        visible={showCategoryModal}
        selectedCategory={category}
        onSelect={setCategory}
        onClose={() => setShowCategoryModal(false)}
      />

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
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerRow}>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Día</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate(1)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>{tempDate.getDate()}</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustDate(-1)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Mes</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustMonth(1)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempDate.toLocaleDateString('es-ES', { month: 'short' })}
                    </Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustMonth(-1)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Año</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustMonth(12)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>{tempDate.getFullYear()}</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustMonth(-12)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.selectedPreview}>
                <Text style={styles.selectedPreviewText}>
                  {tempDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
              <TouchableOpacity style={styles.confirmPickerButton} onPress={confirmDate}>
                <Text style={styles.confirmPickerButtonText}>Confirmar Fecha</Text>
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
              <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerRow}>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Hora</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustHour(1)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempTime.hours.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustHour(-1)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pickerColumn}>
                  <Text style={styles.pickerLabel}>Minutos</Text>
                  <View style={styles.pickerControls}>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustMinute(15)}>
                      <MaterialCommunityIcons name="chevron-up" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={styles.pickerValue}>
                      {tempTime.minutes.toString().padStart(2, '0')}
                    </Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustMinute(-15)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.selectedPreview}>
                <Text style={styles.selectedPreviewText}>
                  {tempTime.hours.toString().padStart(2, '0')}:
                  {tempTime.minutes.toString().padStart(2, '0')}
                </Text>
              </View>
              <TouchableOpacity style={styles.confirmPickerButton} onPress={confirmTime}>
                <Text style={styles.confirmPickerButtonText}>Confirmar Hora</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const BACKGROUND_COLOR = '#F6F8F7';

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

  // ScrollView
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },

  // Challenge Banner
  challengeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(247, 182, 52, 0.4)',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    marginBottom: 28,
    marginTop: 8,
  },
  challengeIconWrapper: {
    position: 'relative',
  },
  challengeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(247, 182, 52, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  xpBadge: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
  },
  xpText: {
    fontSize: 10,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#FFFFFF',
  },
  challengeTextWrapper: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  challengeDescription: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#6B7280',
    marginTop: 4,
    lineHeight: 18,
  },

  // Field spacing
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

  // Category Select
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

  // Date & Time
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
    borderColor: 'rgba(16, 90, 57, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  dateTimeText: {
    fontSize: 15,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#1F2937',
    flex: 1,
  },

  // Approval Section
  approvalSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.05)',
    gap: 16,
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  approvalTextWrapper: {
    flex: 1,
    marginRight: 12,
  },
  approvalTitle: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
  },
  approvalSubtitle: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.REGULAR,
    color: '#6B7280',
    marginTop: 2,
  },
  toggleTouchArea: {
    padding: 4,
  },
  toggleTrack: {
    width: 48,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: { elevation: 2 },
    }),
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(16, 90, 57, 0.05)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 11,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: 'rgba(16, 90, 57, 0.8)',
    lineHeight: 16,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  manageButtonText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
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

  // Modal (Date/Time pickers)
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
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: '#6B7280',
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
