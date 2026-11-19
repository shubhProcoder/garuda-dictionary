export const lightThemeColors = {
  // Approved Phase 1 Light Design Tokens
  canvasPaper: '#FAF7F2',
  elevatedSurface: '#FFFFFF',
  primaryCobalt: '#2B4AE8',
  phoneticViolet: '#7B3FE4',
  semanticEmerald: '#059669',
  warningAmber: '#D97706',
  primaryText: '#111827',
  limeHighlight: '#C8F36B',

  // Backward-compatible aliases and utility tokens
  paper: '#FAF7F2',
  paperDeep: '#F0EDE6',
  white: '#FFFFFF',
  surface: '#FFFFFF',
  ink: '#111827',
  muted: '#6B7280',
  line: '#E5E2D9',
  blue: '#2B4AE8',
  blueDark: '#1A35B8',
  lime: '#C8F36B',
  lavender: '#EEECFA',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
};

export const darkThemeColors = {
  // Deliberate Phase 6 Dark Design Tokens
  canvasPaper: '#121316',
  elevatedSurface: '#1C1D22',
  primaryCobalt: '#5B7BFA',
  phoneticViolet: '#A78BFA',
  semanticEmerald: '#10B981',
  warningAmber: '#F59E0B',
  primaryText: '#F3F4F6',
  limeHighlight: '#C8F36B',

  // Consistent tokens matching the light theme shape
  paper: '#121316',
  paperDeep: '#16171B',
  white: '#1C1D22',
  surface: '#1C1D22',
  ink: '#F3F4F6',
  muted: '#9CA3AF',
  line: '#2B2C33',
  blue: '#5B7BFA',
  blueDark: '#7892FF',
  lime: '#C8F36B',
  lavender: '#272338',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

export type ThemeColors = typeof lightThemeColors;

// Default alias for backward compatibility with static imports
export const colors: ThemeColors = lightThemeColors;

// Devanagari Reading Size Scales
export type DevanagariScaleValue = 'small' | 'medium' | 'large';

export const DEVANAGARI_SCALES: Record<DevanagariScaleValue, number> = {
  small: 0.9,
  medium: 1.0,
  large: 1.15,
};

/**
 * Calculates a scaled font size for Devanagari headwords, preserving whole-pixel values.
 */
export function scaleDevanagari(baseFontSize: number, size: DevanagariScaleValue | number): number {
  const factor = typeof size === 'number' ? size : (DEVANAGARI_SCALES[size] ?? 1.0);
  return Math.round(baseFontSize * factor);
}

/**
 * Calculates a comfortable, non-clipping line height for Devanagari text.
 * A multiplier of 1.30x-1.35x guarantees room for both top vowel matras (ै, ौ, ी)
 * and bottom conjuncts/subscripts (ु, ू, ृ, ्).
 */
export function devanagariLineHeight(fontSize: number, multiplier = 1.32): number {
  return Math.round(fontSize * multiplier);
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const typography = {
  fontSize: {
    badge: 10,
    caption: 12,
    body: 14,
    bodyLarge: 16,
    subheading: 18,
    heading: 22,
    display: 32,
    headword: 40,
    headwordLarge: 56,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const borderRadius = {
  xs: 3,
  sm: 6,
  md: 10,
  lg: 14,
  pill: 999,
};

export const touchTargets = {
  min: 44,
  androidRecommended: 48,
};
