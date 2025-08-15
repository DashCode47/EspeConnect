import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const globalStyles = {
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,
  
  // Bottom navigator height (80px + padding)
  bottomNavigatorHeight: 80 + (Platform.OS === 'ios' ? 24 : 16),
  
  // Safe area utilities
  getBottomSafeArea: (insets: { bottom: number }) => {
    return insets.bottom + 80 + (Platform.OS === 'ios' ? 24 : 16);
  },
  
  // Common padding
  padding: {
    horizontal: 20,
    vertical: 16,
  },
  
  // Common margins
  margin: {
    small: 8,
    medium: 16,
    large: 24,
  },
  
  // Border radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 24,
  },
  
  // Shadows
  shadow: {
    small: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
  },
};

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