export const colors = {
  // Approved Phase 1 Design Tokens
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
