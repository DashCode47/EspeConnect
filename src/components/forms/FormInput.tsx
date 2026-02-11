import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../config/colors';
import { FONT_FAMILY } from '../../config/globalStyles';

interface FormInputProps extends TextInputProps {
  label: string;
  leftIcon?: string;
  containerStyle?: ViewStyle;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  leftIcon,
  containerStyle,
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={22}
            color={colors.accent}
            style={styles.leftIcon}
          />
        )}
        <TextInput
          placeholderTextColor="#9CA3AF"
          {...textInputProps}
          style={[
            styles.input,
            leftIcon && styles.inputWithIcon,
            style,
          ]}
        />
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(16, 90, 57, 0.1)',
    borderRadius: 16,
  },
  leftIcon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 15,
    color: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  inputWithIcon: {
    paddingLeft: 12,
  },
});
