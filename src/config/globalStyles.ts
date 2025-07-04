import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  // Common text sizes
  textSmall: {
    fontSize: 12,
  },
  textBody: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 16,
  },
  textTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  textHeading: {
    fontSize: 24,
    fontWeight: '600',
  },
  textDisplay: {
    fontSize: 32,
    fontWeight: '700',
  },
});

// Font weight constants for easy reference
export const FONT_WEIGHT = {
  REGULAR: '400',
  MEDIUM: '500',
  SEMI_BOLD: '600',
  BOLD: '700',
  LIGHT: '300',
  THIN: '100',
  EXTRA_BOLD: '800',
  BLACK: '900',
} as const; 

export const FONT_FAMILY = {
  REGULAR: 'Urbanist',
  BOLD: 'Urbanist_700Bold',
} as const;