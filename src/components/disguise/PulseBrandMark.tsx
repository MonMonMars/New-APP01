import { ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { BrandMark } from '../brand/BrandMark';
import { useTheme } from '../../context/ThemeContext';
import { pulseBrand } from '../../theme/pulseBrand';

type PulseBrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
  style?: StyleProp<ImageStyle>;
};

/** Pulse logomark — locked P3 didone P on Pulse blue. */
export function PulseBrandMark({ size = 'md', muted = false, style }: PulseBrandMarkProps) {
  return <BrandMark world="pulse" size={size} muted={muted} style={style} />;
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
