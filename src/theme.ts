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
  /** Ember world accent — amber, distinct from Spark pink */
  ember: string;
};

export const darkColors: ColorPalette = {
  background: '#0F0F10',
  surface: '#1A1A1C',
  card: '#FFFFFF',
  text: '#FFFFFF',
  textMuted: '#A0A0A5',
  textDark: '#111111',
  like: '#21D07A',
  heartRed: '#E94057',
  heartPink: '#FF6B8A',
  nope: '#FF4458',
  passDim: '#1A1A1C',
  superLike: '#1EC3FF',
  boost: '#A855F7',
  rewind: '#F5B300',
  gradientStart: '#FF6B6B',
  gradientEnd: '#FF2D55',
  overlay: 'rgba(0, 0, 0, 0.35)',
  stampLike: 'rgba(33, 208, 122, 0.9)',
  stampNope: 'rgba(255, 68, 88, 0.9)',
  border: '#2A2A2E',
  ember: '#FFB020',
};

export const lightColors: ColorPalette = {
  background: '#F8F8FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#111111',
  textMuted: '#6B6B70',
  textDark: '#111111',
  like: '#21D07A',
  heartRed: '#E94057',
  heartPink: '#FF6B8A',
  nope: '#FF4458',
  passDim: '#E8E8EC',
  superLike: '#1EC3FF',
  boost: '#A855F7',
  rewind: '#F5B300',
  gradientStart: '#FF6B6B',
  gradientEnd: '#FF2D55',
  overlay: 'rgba(0, 0, 0, 0.25)',
  stampLike: 'rgba(33, 208, 122, 0.9)',
  stampNope: 'rgba(255, 68, 88, 0.9)',
  border: '#E0E0E4',
  ember: '#D97706',
};

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
