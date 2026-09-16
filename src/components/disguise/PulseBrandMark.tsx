import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { pulseBrand } from '../../theme/pulseBrand';

type PulseBrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

/** Geometric logomark — stacked news lines in a rounded tile (BBC / Reuters style). */
export function PulseBrandMark({ size = 'md', style }: PulseBrandMarkProps) {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';
  const dimensions = size === 'sm' ? 28 : size === 'lg' ? 40 : 34;
  const barHeight = size === 'sm' ? 2 : 2.5;
  const barGap = size === 'sm' ? 3 : 4;
  const barWidths = size === 'sm' ? [14, 11, 8] : size === 'lg' ? [20, 16, 11] : [17, 13, 9];

  return (
    <View
      style={[
        styles.mark,
        {
          width: dimensions,
          height: dimensions,
          borderRadius: size === 'lg' ? 9 : 7,
          backgroundColor: isDark ? pulseBrand.accentBright : pulseBrand.navy,
        },
        style,
      ]}
    >
      {barWidths.map((width, index) => (
        <View
          key={index}
          style={{
            width,
            height: barHeight,
            borderRadius: barHeight / 2,
            backgroundColor: '#FFFFFF',
            marginBottom: index < barWidths.length - 1 ? barGap : 0,
            opacity: 1 - index * 0.12,
          }}
        />
      ))}
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
  const fontSize = size === 'sm' ? 18 : size === 'lg' ? 26 : 22;

  return (
    <View style={styles.wordmarkWrap}>
      <Text
        style={[
          styles.wordmark,
          {
            fontSize,
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
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 7,
  },
  wordmarkWrap: {
    justifyContent: 'center',
  },
  wordmark: {
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 24,
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
