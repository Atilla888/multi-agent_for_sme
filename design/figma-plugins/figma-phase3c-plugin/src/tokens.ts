export const primitive = {
  white: '#FFFFFF', neutral50: '#F8FAFC', neutral100: '#F1F5F9', neutral200: '#E2E8F0',
  neutral400: '#94A3B8', neutral600: '#475569', neutral800: '#1E293B', neutral900: '#0F172A',
  navy600: '#174A7E', navy700: '#123D69', blue50: '#EFF6FF', blue700: '#1D4ED8',
  green50: '#ECFDF5', green700: '#047857', amber50: '#FFFBEB', amber800: '#92400E',
  red50: '#FEF2F2', red700: '#B91C1C', violet50: '#F5F3FF', violet700: '#6D28D9',
  teal700: '#0F766E', indigo50: '#EEF2FF', indigo700: '#4338CA',
} as const;

export const semantic = {
  'surface/default': 'white', 'surface/subtle': 'neutral50', 'surface/elevated': 'white',
  'surface/selected': 'blue50', 'text/primary': 'neutral900', 'text/secondary': 'neutral600',
  'text/muted': 'neutral600', 'text/inverse': 'white', 'border/default': 'neutral200',
  'border/strong': 'neutral400', 'border/interactive': 'navy600',
  'action/primary': 'navy700', 'action/secondary': 'neutral100',
  'action/destructive': 'red700', 'focus/ring': 'blue700',
  'status/success': 'green700', 'status/success-bg': 'green50',
  'status/pending': 'blue700', 'status/pending-bg': 'blue50',
  'status/warning': 'amber800', 'status/warning-bg': 'amber50',
  'status/error': 'red700', 'status/error-bg': 'red50',
  'status/unknown': 'violet700', 'status/unknown-bg': 'violet50',
  'status/stale': 'amber800', 'status/stale-bg': 'amber50',
  'status/restricted': 'neutral800', 'status/restricted-bg': 'neutral100',
  'status/waiting-human': 'indigo700', 'status/waiting-human-bg': 'indigo50',
  'status/dependency': 'neutral600', 'status/dependency-bg': 'neutral100',
  'status/model-not-ready': 'neutral600', 'status/model-not-ready-bg': 'neutral100',
  'status/info': 'teal700', 'status/info-bg': 'neutral50',
  'chart/actual': 'navy700', 'chart/predicted': 'violet700', 'chart/grid': 'neutral200',
} as const satisfies Record<string, keyof typeof primitive>;

export const spacing = [4, 8, 12, 16, 24, 32, 48] as const;
export const radius = { small: 4, control: 6, card: 8, pill: 999 } as const;
export const elevation = { base: 'none', floating: 'subtle shadow + border', modal: 'moderate shadow + scrim' } as const;
export const typeScale = {
  'Page Title': [28, 36, 'Bold'], 'Section Heading': [20, 28, 'Semi Bold'],
  'Card Heading': [16, 24, 'Semi Bold'], 'Body': [14, 22, 'Regular'],
  'Body Strong': [14, 22, 'Semi Bold'], 'Small': [13, 20, 'Regular'],
  'Caption': [12, 18, 'Regular'], 'Label': [12, 18, 'Semi Bold'],
  'Metric': [24, 32, 'Semi Bold'],
} as const;

export function rgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 };
}

export function contrast(a: string, b: string): number {
  const luminance = (hex: string): number => {
    const c = rgb(hex);
    const linear = (v: number) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    return 0.2126 * linear(c.r) + 0.7152 * linear(c.g) + 0.0722 * linear(c.b);
  };
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
