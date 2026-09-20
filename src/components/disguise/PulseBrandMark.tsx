import { ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { BrandMark } from '../brand/BrandMark';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { pulseBrand, pulseTimesFontFamily } from '../../theme/pulseBrand';

type PulseBrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
  style?: StyleProp<ImageStyle>;
};

/** Pulse logomark — locked P3 didone P on Pulse blue. */
export function PulseBrandMark({ size = 'md', muted = false, style }: PulseBrandMarkProps) {
  return <BrandMark world="pulse" size={size} muted={muted} style={style} />;
}

type PulseHeaderLogoProps = {
  size?: 'sm' | 'md';
};

/** Top-left Pulse masthead — blue P logomark + white “Pulse” wordmark. */
export function PulseHeaderLogo({ size = 'sm' }: PulseHeaderLogoProps) {
  const markSize = size === 'sm' ? 'sm' : 'md';
  const wordSize = size === 'sm' ? 22 : 26;

  return (
    <View style={styles.headerLogoRow} pointerEvents="none">
      <PulseBrandMark size={markSize} />
      <Text
        style={[
          styles.headerWordmark,
          {
            fontSize: wordSize,
            lineHeight: wordSize + 2,
            color: pulseBrand.mastheadText,
            fontFamily: pulseTimesFontFamily,
          },
        ]}
      >
        Pulse
      </Text>
    </View>
  );
}

type PulseWordmarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  tagline?: string;
};

/** Masthead wordmark for Pulse disguise headers. */
export function PulseWordmark({ size = 'md', showTagline = false, tagline }: PulseWordmarkProps) {
  const { colors, resolvedMode } = useTheme();
  const { t } = useTranslation();
  const isDark = resolvedMode === 'dark';
  const resolvedTagline = tagline ?? t('disguiseWorld.pulseTagline');
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
        <Text style={[styles.tagline, { color: colors.textMuted }]}>{resolvedTagline}</Text>
      ) : null}
    </View>
  );
}

type PulseBrandProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  tagline?: string;
  style?: ViewStyle;
};

/** Combined logomark + wordmark for Pulse mastheads. */
export function PulseBrand({ size = 'md', showTagline = false, tagline, style }: PulseBrandProps) {
  return (
    <View style={[styles.brandRow, style]} pointerEvents="none">
      <PulseBrandMark size={size} />
      <PulseWordmark size={size} showTagline={showTagline} tagline={tagline} />
    </View>
  );
}

const styles = StyleSheet.create({
  headerLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerP: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerWordmark: {
    fontWeight: '600',
    letterSpacing: -0.3,
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
