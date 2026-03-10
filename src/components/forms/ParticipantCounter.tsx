import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../config/colors';
import { FONT_FAMILY } from '../../config/globalStyles';

interface ParticipantCounterProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const ParticipantCounter: React.FC<ParticipantCounterProps> = ({
  label,
  value,
  onChange,
  min = 2,
  max = 50,
}) => {
  const decrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.counterRow}>
        <TouchableOpacity
          style={[styles.button, value <= min && styles.buttonDisabled]}
          onPress={decrement}
          disabled={value <= min}
          activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="minus"
            size={24}
            color={value <= min ? '#D1D5DB' : colors.primary}
          />
        </TouchableOpacity>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
        </View>
        <TouchableOpacity
          style={[styles.button, value >= max && styles.buttonDisabled]}
          onPress={increment}
          disabled={value >= max}
          activeOpacity={0.7}>
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color={value >= max ? '#D1D5DB' : colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontFamily: FONT_FAMILY.BOLD,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    paddingHorizontal: 8,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    borderColor: '#E5E7EB',
  },
  valueContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.1)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 18,
    fontFamily: FONT_FAMILY.BOLD,
    color: '#1F2937',
  },
});
