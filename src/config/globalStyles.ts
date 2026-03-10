import { Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const globalStyles = {
  // Screen dimensions
  screenWidth: width,
  screenHeight: height,
  
  // Bottom navigator height (floating navbar: 48px height + 24px bottom + padding)
  bottomNavigatorHeight: 48 + 24 + (Platform.OS === 'ios' ? 24 : 16),
  
  // Safe area utilities
  getBottomSafeArea: (insets: { bottom: number }) => {
    // Floating navbar: 48px height + 24px from bottom + safe area
    const baseHeight = 48 + 24 + 16;
    return Math.max(insets.bottom, 0) + baseHeight;
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
  REGULAR: 'LeagueSpartan-Regular',
  MEDIUM: 'LeagueSpartan-Medium',
  SEMI_BOLD: 'LeagueSpartan-SemiBold',
  BOLD: 'LeagueSpartan-Bold',
  LIGHT: 'LeagueSpartan-Light',
  EXTRA_LIGHT: 'LeagueSpartan-ExtraLight',
  EXTRA_BOLD: 'LeagueSpartan-ExtraBold',
  BLACK: 'LeagueSpartan-Black',
} as const;