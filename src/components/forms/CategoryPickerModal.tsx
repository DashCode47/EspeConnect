import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlanCategory } from '../../features/events/domain/entities/plan.entity';
import { colors } from '../../config/colors';
import { FONT_FAMILY } from '../../config/globalStyles';

interface CategoryPickerModalProps {
  visible: boolean;
  selectedCategory: PlanCategory | null;
  onSelect: (category: PlanCategory) => void;
  onClose: () => void;
}

const PLAN_CATEGORIES = [
  { key: PlanCategory.CAFE, label: 'Café', emoji: '☕' },
  { key: PlanCategory.FIESTA, label: 'Fiesta', emoji: '🎉' },
  { key: PlanCategory.ESTUDIO, label: 'Estudio', emoji: '📚' },
  { key: PlanCategory.DEPORTE, label: 'Deporte', emoji: '⚽' },
  { key: PlanCategory.CINE, label: 'Cine', emoji: '🎬' },
  { key: PlanCategory.MUSICA, label: 'Música', emoji: '🎵' },
  { key: PlanCategory.VIAJE, label: 'Viaje', emoji: '✈️' },
  { key: PlanCategory.COMIDA, label: 'Comida', emoji: '🍕' },
  { key: PlanCategory.OTRO, label: 'Otro', emoji: '🎨' },
];

export const getCategoryLabel = (category: PlanCategory): string => {
  return PLAN_CATEGORIES.find(c => c.key === category)?.label ?? category;
};

export const getCategoryEmoji = (category: PlanCategory): string => {
  return PLAN_CATEGORIES.find(c => c.key === category)?.emoji ?? '📌';
};

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  selectedCategory,
  onSelect,
  onClose,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Seleccionar Categoría</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.primaryDark}
              />
            </TouchableOpacity>
          </View>
          {PLAN_CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.key}
              style={styles.option}
              onPress={() => {
                onSelect(cat.key);
                onClose();
              }}>
              <View style={styles.optionLeft}>
                <Text style={styles.emoji}>{cat.emoji}</Text>
                <Text style={styles.optionText}>{cat.label}</Text>
              </View>
              {selectedCategory === cat.key && (
                <MaterialCommunityIcons
                  name="check"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primaryDark,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  emoji: {
    fontSize: 20,
  },
  optionText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY.MEDIUM,
    color: colors.primaryDark,
  },
});
