import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { FONT_FAMILY } from './globalStyles';

const fontConfig = {
  displayLarge: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: 57,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 64,
  },
  displayMedium: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: 45,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 52,
  },
  displaySmall: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: 36,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 44,
  },
  headlineLarge: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 0,
    lineHeight: 40,
  },
  headlineMedium: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 36,
  },
  headlineSmall: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 32,
  },
  titleLarge: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: 22,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 28,
  },
  titleMedium: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 16,
    fontWeight: '500' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  titleSmall: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelLarge: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    lineHeight: 20,
  },
  labelMedium: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 12,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  labelSmall: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  bodyLarge: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.15,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 14,
    fontWeight: '400' as const,
    letterSpacing: 0.25,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 12,
    fontWeight: '400' as const,
    letterSpacing: 0.4,
    lineHeight: 16,
  },
  default: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontWeight: '400' as const,
  },
};

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    // Add your custom colors here if needed
  },
}; 