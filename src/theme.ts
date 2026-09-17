import { harborBrand } from './theme/harborBrand';
import { pulseBrand } from './theme/pulseBrand';
import { sparkBrand } from './theme/sparkBrand';

export type ColorPalette = {
  background: string;
  surface: string;
  card: string;
  text: string;
  textMuted: string;
  textDark: string;
  like: string;
  heartRed: string;
  heartPink: string;
  nope: string;
  passDim: string;
  superLike: string;
  boost: string;
  rewind: string;
  gradientStart: string;
  gradientEnd: string;
  overlay: string;
  stampLike: string;
  stampNope: string;
  border: string;
  /** Ember world accent — pale gold from E1e, distinct from Spark pink */
  ember: string;
};

function hexAlpha(hex: string, alpha: number): string {
  const raw = hex.replace('#', '');
  if (raw.length !== 6) {
    return hex;
  }
  const n = Number.parseInt(raw, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Every interactive accent in a world uses this one color. */
function buttonTokens(accent: string): Pick<
  ColorPalette,
  | 'like'
  | 'heartRed'
  | 'heartPink'
  | 'nope'
  | 'superLike'
  | 'boost'
  | 'rewind'
  | 'gradientStart'
  | 'gradientEnd'
  | 'stampLike'
  | 'stampNope'
> {
  return {
    like: accent,
    heartRed: accent,
    heartPink: accent,
    nope: accent,
    superLike: accent,
    boost: accent,
    rewind: accent,
    gradientStart: accent,
    gradientEnd: accent,
    stampLike: hexAlpha(accent, 0.9),
    stampNope: hexAlpha(accent, 0.9),
  };
}

export const darkColors: ColorPalette = {
  background: '#0F0F10',
  surface: '#1A1A1C',
  card: '#FFFFFF',
  text: '#FFFFFF',
  textMuted: '#A0A0A5',
  textDark: '#111111',
  passDim: '#1A1A1C',
  overlay: 'rgba(0, 0, 0, 0.35)',
  border: '#2A2A2E',
  ember: harborBrand.accent,
  ...buttonTokens(sparkBrand.accent),
};

export const lightColors: ColorPalette = {
  background: '#F8F8FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111111',
  textMuted: '#6B6B70',
  textDark: '#111111',
  passDim: '#E8E8EC',
  overlay: 'rgba(0, 0, 0, 0.25)',
  border: '#E0E0E4',
  ember: harborBrand.accent,
  ...buttonTokens(sparkBrand.accent),
};

/** One accent per world for every button: Spark pink, Ember gold, Pulse blue, Harbor gold. */
export function paletteForSection(
  base: ColorPalette,
  section: 'spark' | 'ember',
  disguise = false,
): ColorPalette {
  switch (section) {
    case 'spark':
      return disguise
        ? { ...base, ...buttonTokens(pulseBrand.accent) }
        : base;
    case 'ember':
      return {
        ...base,
        ember: harborBrand.accent,
        ...buttonTokens(harborBrand.accent),
      };
    default: {
      const _exhaustive: never = section;
      return _exhaustive;
    }
  }
}

/** Default export for backward compatibility — dark palette */
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radii = {
  card: 16,
  button: 999,
};
