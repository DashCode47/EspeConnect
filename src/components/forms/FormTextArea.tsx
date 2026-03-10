import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { colors } from '../../config/colors';
import { FONT_FAMILY } from '../../config/globalStyles';

interface FormTextAreaProps extends TextInputProps {
  label: string;
  containerStyle?: ViewStyle;
}

export const FormTextArea: React.FC<FormTextAreaProps> = ({
  label,
  containerStyle,
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor="#9CA3AF"
        multiline
        textAlignVertical="top"
        {...textInputProps}
        style={[styles.input, style]}
      />
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
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.1)',
    borderRadius: 16,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 15,
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 100,
  },
});
