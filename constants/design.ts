/**
 * Design System Constants
 * Based on design.json - Educational Dashboard Design System
 */

export const DesignColors = {
  primary: {
    violet: '#8B5CF6',
    violetLight: '#A78BFA',
    violetDark: '#7C3AED',
  },
  secondary: {
    white: '#FFFFFF',
    offWhite: '#F9FAFB',
  },
  accent: {
    orange: '#FB923C',
    orangeLight: '#FDBA74',
    peach: '#FED7AA',
    coral: '#FCA5A5',
  },
  neutral: {
    black: '#1F2937',
    darkGray: '#374151',
    mediumGray: '#6B7280',
    lightGray: '#E5E7EB',
    backgroundBeige: '#FFEFD5',
  },
  supporting: {
    blue: '#60A5FA',
    blueLight: '#93C5FD',
    yellow: '#FCD34D',
    green: '#34D399',
    pink: '#F472B6',
  },
} as const;

export const DesignSpacing = {
  xs: 4, // 0.25rem
  sm: 8, // 0.5rem
  md: 16, // 1rem
  lg: 24, // 1.5rem
  xl: 32, // 2rem
  '2xl': 40, // 2.5rem
  '3xl': 48, // 3rem
} as const;

export const DesignBorderRadius = {
  sm: 6, // 0.375rem
  md: 8, // 0.5rem
  lg: 12, // 0.75rem
  xl: 16, // 1rem
  '2xl': 24, // 1.5rem
  '3xl': 32, // 2rem
  full: 9999,
  card: 24, // 1.5rem
  button: 9999,
} as const;

export const DesignShadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  base: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  soft: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export const DesignTypography = {
  fontSize: {
    xs: 12, // 0.75rem
    sm: 14, // 0.875rem
    base: 16, // 1rem
    lg: 18, // 1.125rem
    xl: 20, // 1.25rem
    '2xl': 24, // 1.5rem
    '3xl': 30, // 1.875rem
    '4xl': 36, // 2.25rem
    '5xl': 48, // 3rem
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;


