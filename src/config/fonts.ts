import { FONT_FAMILY } from './globalStyles';

/**
 * Configuración de fuentes para toda la aplicación
 * Usa League Spartan como fuente principal
 */
export const fonts = {
  // Fuentes principales
  regular: FONT_FAMILY.REGULAR,
  medium: FONT_FAMILY.MEDIUM,
  semiBold: FONT_FAMILY.SEMI_BOLD,
  bold: FONT_FAMILY.BOLD,
  
  // Fuentes adicionales
  light: FONT_FAMILY.LIGHT,
  extraLight: FONT_FAMILY.EXTRA_LIGHT,
  extraBold: FONT_FAMILY.EXTRA_BOLD,
  black: FONT_FAMILY.BLACK,
  
  // Estilos de texto comunes
  h1: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: 32,
    fontWeight: '700' as const,
  },
  h2: {
    fontFamily: FONT_FAMILY.BOLD,
    fontSize: 28,
    fontWeight: '700' as const,
  },
  h3: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: 24,
    fontWeight: '600' as const,
  },
  h4: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: 20,
    fontWeight: '600' as const,
  },
  h5: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 18,
    fontWeight: '500' as const,
  },
  h6: {
    fontFamily: FONT_FAMILY.MEDIUM,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  body: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily: FONT_FAMILY.REGULAR,
    fontSize: 12,
    fontWeight: '400' as const,
  },
  button: {
    fontFamily: FONT_FAMILY.SEMI_BOLD,
    fontSize: 16,
    fontWeight: '600' as const,
  },
};

export default fonts;

