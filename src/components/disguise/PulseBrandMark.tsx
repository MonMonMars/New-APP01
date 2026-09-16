import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { pulseBrand } from '../../theme/pulseBrand';

type PulseBrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

const SIZE_PX = { sm: 28, md: 34, lg: 40 } as const;
const RADIUS = { sm: 7, md: 8, lg: 10 } as const;
const LETTER = { sm: 16, md: 20, lg: 24 } as const;
const PIP = { sm: 6, md: 7, lg: 8 } as const;

/** Professional Pulse logomark — live news “P” tile. */
export function PulseBrandMark({ size = 'md', style }: PulseBrandMarkProps) {
  const { resolvedMode } = useTheme();
  const isDark = resolvedMode === 'dark';
  const dimensions = SIZE_PX[size];
  const pip = PIP[size];

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
      pointerEvents="none"
    >
      <Text
        style={[
          styles.letter,
          {
            fontSize: LETTER[size],
            lineHeight: LETTER[size] + 2,
          },
        ]}
      >
        P
      </Text>
      <View
        style={[
          styles.pip,
          {
            width: pip,
            height: pip,
            borderRadius: pip / 2,
            top: size === 'sm' ? 3 : 4,
            right: size === 'sm' ? 3 : 4,
          },
        ]}
      />
    </View>
  );
}

type PulseWordmarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
};

/** Masthead wordmark for Pulse disguise headers. */
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

/** Combined logomark + wordmark for Pulse mastheads. */
export function PulseBrand({ size = 'md', showTagline = false, style }: PulseBrandProps) {
  return (
    <View style={[styles.brandRow, style]} pointerEvents="none">
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
  letter: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: -0.8,
    marginLeft: -1,
  },
  pip: {
    position: 'absolute',
    backgroundColor: pulseBrand.live,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  wordmarkWrap: {
    justifyContent: 'center',
    minWidth: 0,
    flexShrink: 1,
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
