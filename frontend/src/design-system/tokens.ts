/**
 * OmniCart AI 2.0 — Centralized Design Tokens
 * Apple-inspired Liquid Glass Material System
 * Strictly Palette: Black + Graphite + Charcoal + Dark Gray + Soft Gray + Emerald Green
 */

export const colors = {
  // Dark Tones
  nearBlack: '#090a0d',
  black: '#0c0e12',
  graphite: '#12151b',
  charcoal: '#171c24',
  darkGray: '#202631',
  midGray: '#333b49',
  borderGray: '#242b38',

  // Text Tones
  textPrimary: '#f8fafc',
  textSecondary: '#94a3b8',
  textTertiary: '#64748b',
  textMuted: '#475569',

  // Signature Accent: Emerald Green
  emerald: {
    DEFAULT: '#10b981',
    light: '#34d399',
    dark: '#059669',
    muted: 'rgba(16, 185, 129, 0.14)',
    glow: 'rgba(16, 185, 129, 0.28)',
    border: 'rgba(16, 185, 129, 0.35)',
  },

  // Semantic
  danger: '#ef4444',
  dangerMuted: 'rgba(239, 68, 68, 0.15)',
  warning: '#f59e0b',
  warningMuted: 'rgba(245, 158, 11, 0.15)',
};

export const radius = {
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '2rem',    // 32px
  full: '9999px',
};

export const blur = {
  subtle: '12px',
  normal: '20px',
  elevated: '24px',
  floating: '32px',
  heavy: '40px',
};

export const materials = {
  liquidGlassSubtle: 'liquid-glass-subtle',
  liquidGlass: 'liquid-glass',
  liquidGlassElevated: 'liquid-glass-elevated',
  liquidGlassFloating: 'liquid-glass-floating',
  liquidGlassGreen: 'liquid-glass-green',
};

export const zIndex = {
  base: 0,
  card: 10,
  header: 30,
  navigation: 40,
  modal: 50,
  toast: 60,
};

export const tokens = {
  colors,
  radius,
  blur,
  materials,
  zIndex,
  motion: {
    micro: { type: 'spring', stiffness: 500, damping: 30, mass: 1 },
    normal: { type: 'spring', stiffness: 400, damping: 30, mass: 1 },
    page: { type: 'spring', stiffness: 300, damping: 30, mass: 1 },
    springy: { type: 'spring', stiffness: 450, damping: 25 },
  },
  durations: {
    micro: 0.15,
    normal: 0.3,
    page: 0.45,
    large: 0.7,
  },
};
