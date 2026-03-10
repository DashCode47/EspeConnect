import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { EventStackParamList } from '../../../../navigation/types';
import { usePlanStore } from '../store/plan.store';
import { PlanCategory } from '../../domain/entities/plan.entity';
import { colors } from '../../../../config/colors';
import { FONT_FAMILY } from '../../../../config/globalStyles';
import { useHideNavbar } from '../../../../hooks/useHideNavbar';
import { FormInput } from '../../../../components/forms/FormInput';
import { FormTextArea } from '../../../../components/forms/FormTextArea';
import {
  CategoryPickerModal,
  getCategoryLabel,
  getCategoryEmoji,
} from '../../../../components/forms/CategoryPickerModal';
import { ParticipantCounter } from '../../../../components/forms/ParticipantCounter';

type NavigationProp = NativeStackNavigationProp<EventStackParamList, 'EditPlan'>;
type RouteProps = RouteProp<EventStackParamList, 'EditPlan'>;

export const EditPlanScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { planId } = route.params;
  useHideNavbar(true);

  const [initialLoading, setInitialLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<PlanCategory | null>(null);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<{ hours: number; minutes: number } | null>(null);
  const [locationName, setLocationName] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(5);

  const { fetchPlanById, updatePlan } = usePlanStore();
  const [loading, setLoading] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [tempDate, setTempDate] = useState(new Date());
  const [tempTime, setTempTime] = useState({ hours: 9, minutes: 0 });

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const plan = await fetchPlanById(planId);
        if (plan) {
          setTitle(plan.title);
          setCategory(plan.category);
          setDescription(plan.description || '');
          setDate(new Date(plan.date + 'T00:00:00'));
          const [h, m] = plan.startTime.split(':');
          setStartTime({ hours: parseInt(h, 10), minutes: parseInt(m, 10) });
          setLocationName(plan.locationName || '');
          setMaxParticipants(plan.maxParticipants || 5);
        } else {
          Alert.alert('Error', 'No se pudo cargar el plan.');
          navigation.goBack();
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo cargar el plan.');
        navigation.goBack();
      } finally {
        setInitialLoading(false);
      }
    };
    loadPlan();
  }, [planId]);

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
    if (newDate >= today) setTempDate(newDate);
  };

  const adjustMonth = (months: number) => {
    const newDate = new Date(tempDate);
    newDate.setMonth(newDate.getMonth() + months);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (newDate >= today) setTempDate(newDate);
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
      if (m < 0) m = 45;
      if (m > 59) m = 0;
      return { ...prev, minutes: m };
    });
  };

  const confirmTime = () => {
    setStartTime({ ...tempTime });
    setShowTimePicker(false);
  };

  const formatDateDisplay = (d: Date | null) => {
    if (!d) return '';
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatTimeDisplay = (t: { hours: number; minutes: number } | null) => {
    if (!t) return '';
    return `${t.hours.toString().padStart(2, '0')}:${t.minutes.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!title.trim()) { Alert.alert('Error', 'El título del plan es requerido'); return; }
    if (!category) { Alert.alert('Error', 'Selecciona una categoría'); return; }
    if (!date) { Alert.alert('Error', 'La fecha es requerida'); return; }
    if (!startTime) { Alert.alert('Error', 'La hora es requerida'); return; }

    try {
      setLoading(true);
      const success = await updatePlan(planId, {
        title: title.trim(),
        description: description.trim() || '',
        category: category!,
        date: date.toISOString().split('T')[0],
        startTime: formatTimeDisplay(startTime),
        locationName: locationName.trim() || '',
        maxParticipants: maxParticipants,
      });

      if (success) {
        Alert.alert('Plan actualizado', 'Los cambios han sido guardados.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Error', 'No se pudo actualizar el plan.');
      }
    } catch (error: any) {
      Alert.alert('Error', 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Plan</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <FormInput
          label="Título del Plan"
          placeholder="Ej: Café después de clases ☕"
          value={title}
          onChangeText={setTitle}
          containerStyle={styles.fieldSpacing}
        />

        <View style={styles.fieldSpacing}>
          <Text style={styles.fieldLabel}>Categoría</Text>
          <TouchableOpacity style={styles.selectButton} onPress={() => setShowCategoryModal(true)} activeOpacity={0.7}>
            <Text style={[styles.selectText, !category && styles.selectPlaceholder]}>
              {category ? `${getCategoryEmoji(category)} ${getCategoryLabel(category)}` : 'Selecciona una categoría'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <FormTextArea
          label="Descripción"
          placeholder="¿De qué trata el plan? Cuéntanos los detalles..."
          value={description}
          onChangeText={setDescription}
          numberOfLines={3}
          containerStyle={styles.fieldSpacing}
        />

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

        <FormInput
          label="Ubicación"
          placeholder="Ej: Biblioteca central o Sala 4"
          value={locationName}
          onChangeText={setLocationName}
          leftIcon="map-marker"
          containerStyle={styles.fieldSpacing}
        />

        <View style={styles.fieldSpacing}>
          <ParticipantCounter
            label="Número de participantes"
            value={maxParticipants}
            onChange={setMaxParticipants}
            min={2}
            max={50}
          />
        </View>
      </ScrollView>

      <View style={[styles.bottomCta, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.9}>
          <Text style={styles.submitButtonText}>{loading ? 'Guardando...' : 'Guardar Cambios'}</Text>
          {!loading && <MaterialCommunityIcons name="content-save-outline" size={22} color={colors.primary} />}
        </TouchableOpacity>
      </View>

      <CategoryPickerModal
        visible={showCategoryModal}
        selectedCategory={category}
        onSelect={setCategory}
        onClose={() => setShowCategoryModal(false)}
      />

      <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
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
                    <Text style={styles.pickerValue}>{tempDate.toLocaleDateString('es-ES', { month: 'short' })}</Text>
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
                  {tempDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
              </View>
              <TouchableOpacity style={styles.confirmPickerButton} onPress={confirmDate}>
                <Text style={styles.confirmPickerButtonText}>Confirmar Fecha</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showTimePicker} transparent animationType="slide" onRequestClose={() => setShowTimePicker(false)}>
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
                    <Text style={styles.pickerValue}>{tempTime.hours.toString().padStart(2, '0')}</Text>
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
                    <Text style={styles.pickerValue}>{tempTime.minutes.toString().padStart(2, '0')}</Text>
                    <TouchableOpacity style={styles.pickerButton} onPress={() => adjustMinute(-15)}>
                      <MaterialCommunityIcons name="chevron-down" size={24} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.selectedPreview}>
                <Text style={styles.selectedPreviewText}>
                  {tempTime.hours.toString().padStart(2, '0')}:{tempTime.minutes.toString().padStart(2, '0')}
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
  safeArea: { flex: 1, backgroundColor: BACKGROUND_COLOR },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: `${BACKGROUND_COLOR}F2`,
  },
  backButton: {
    width: 40, height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(16, 90, 57, 0.1)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: { fontSize: 18, fontFamily: FONT_FAMILY.BOLD, color: colors.primary, flex: 1, textAlign: 'center' },
  headerSpacer: { width: 40 },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 8 },
  fieldSpacing: { marginBottom: 24 },
  fieldLabel: {
    fontSize: 12, fontFamily: FONT_FAMILY.BOLD, color: colors.primary,
    textTransform: 'uppercase', letterSpacing: 1.5, paddingHorizontal: 8, marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: 'rgba(16, 90, 57, 0.2)',
    borderRadius: 16, paddingHorizontal: 20, paddingVertical: 16,
  },
  selectText: { fontSize: 15, fontFamily: FONT_FAMILY.REGULAR, color: '#1F2937', flex: 1 },
  selectPlaceholder: { color: '#9CA3AF' },
  rowContainer: { flexDirection: 'row', gap: 16 },
  halfWidth: { flex: 1 },
  dateTimeButton: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: 'rgba(16, 90, 57, 0.1)',
    borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, gap: 10,
  },
  dateTimeText: { fontSize: 15, fontFamily: FONT_FAMILY.REGULAR, color: '#1F2937', flex: 1 },
  bottomCta: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 24, paddingTop: 16, backgroundColor: 'transparent',
  },
  submitButton: {
    backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    ...Platform.select({
      ios: { shadowColor: colors.accent, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16 },
      android: { elevation: 8 },
    }),
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: { fontSize: 18, fontFamily: FONT_FAMILY.BOLD, color: colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 20 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  modalTitle: { fontSize: 18, fontFamily: FONT_FAMILY.BOLD, color: colors.primaryDark },
  modalCancelText: { fontSize: 16, fontFamily: FONT_FAMILY.MEDIUM, color: '#6B7280' },
  pickerContainer: { padding: 20 },
  pickerRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24 },
  pickerColumn: { alignItems: 'center', flex: 1 },
  pickerLabel: { fontSize: 12, fontFamily: FONT_FAMILY.MEDIUM, color: '#6B7280', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  pickerControls: { alignItems: 'center' },
  pickerButton: { padding: 8, minWidth: 48, alignItems: 'center' },
  pickerValue: { fontSize: 28, fontFamily: FONT_FAMILY.BOLD, color: colors.primaryDark, marginVertical: 8, minHeight: 40, textAlign: 'center', lineHeight: 40 },
  selectedPreview: { backgroundColor: '#F5F5F5', padding: 14, borderRadius: 12, marginBottom: 20, alignItems: 'center' },
  selectedPreviewText: { fontSize: 16, fontFamily: FONT_FAMILY.SEMI_BOLD, color: colors.primaryDark, textTransform: 'capitalize' },
  confirmPickerButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  confirmPickerButtonText: { fontSize: 16, fontFamily: FONT_FAMILY.BOLD, color: '#FFFFFF' },
});
