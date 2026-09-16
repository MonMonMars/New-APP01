import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { pulseBrand } from '../../theme/pulseBrand';

type PulseBrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

const SIZE_PX = { sm: 28, md: 34, lg: 40 } as const;
const RADIUS = { sm: 8, md: 9, lg: 11 } as const;

/** Professional Pulse logomark — concentric signal rings in a navy tile. */
export function PulseBrandMark({ size = 'md', style }: PulseBrandMarkProps) {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';
  const dimensions = SIZE_PX[size];
  const ringGap = size === 'sm' ? 3.5 : size === 'lg' ? 5 : 4.25;
  const stroke = size === 'sm' ? 1.6 : 1.8;
  const core = size === 'sm' ? 4.5 : size === 'lg' ? 6.5 : 5.5;
  const rings = [ringGap * 2, ringGap * 3.15];

  return (
    <View
      style={[
        styles.mark,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: RADIUS[size],
          backgroundColor: isDark ? pulseBrand.accentBright : pulseBrand.navy,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Pulse"
    >
      {rings.map((diameter) => (
        <View
          key={diameter}
          style={[
            styles.ring,
            {
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              borderWidth: stroke,
              borderColor: 'rgba(255,255,255,0.92)',
            },
          ]}
        />
      ))}
      <View
        style={{
          width: core,
          height: core,
          borderRadius: core / 2,
          backgroundColor: '#FFFFFF',
        }}
      />
    </View>
  );
}

type PulseWordmarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
};

/** Masthead wordmark for disguise headers. */
export function PulseWordmark({ size = 'md', showTagline = false }: PulseWordmarkProps) {
  const { colors, resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';
  const fontSize = size === 'sm' ? 19 : size === 'lg' ? 26 : 22;

  return (
    <View style={styles.wordmarkWrap}>
      <Text
        style={[
          styles.wordmark,
          {
            fontSize,
            lineHeight: fontSize + 4,
            color: isDark ? colors.text : pulseBrand.navy,
          },
        ]}
      >
        Pulse
      </Text>
      {showTagline ? (
        <Text style={[styles.tagline, { color: colors.textMuted }]}>World & Local News</Text>
      ) : null}
    </View>
  );
}

type PulseBrandProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  style?: ViewStyle;
};

/** Combined logomark + wordmark for disguise mastheads. */
export function PulseBrand({ size = 'md', showTagline = false, style }: PulseBrandProps) {
  return (
    <View style={[styles.brandRow, style]}>
      <PulseBrandMark size={size} />
      <PulseWordmark size={size} showTagline={showTagline} />
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
  },
  wordmarkWrap: {
    justifyContent: 'center',
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
});
