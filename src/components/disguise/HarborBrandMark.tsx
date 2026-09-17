import { ImageStyle, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { BrandMark } from '../brand/BrandMark';
import { useTheme } from '../../context/ThemeContext';
import { harborBrand } from '../../theme/harborBrand';

type HarborBrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
  style?: StyleProp<ImageStyle>;
};

/** Harbor logomark — pale-gold H matching Ember E1e. */
export function HarborBrandMark({ size = 'md', muted = false, style }: HarborBrandMarkProps) {
  return <BrandMark world="harbor" size={size} muted={muted} style={style} />;
}

type HarborWordmarkProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
};

export function HarborWordmark({ size = 'md', showTagline = false }: HarborWordmarkProps) {
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
            color: isDark ? colors.text : harborBrand.navy,
          },
        ]}
      >
        Harbor
      </Text>
      {showTagline ? (
        <Text style={[styles.tagline, { color: colors.textMuted }]}>Markets & Briefing</Text>
      ) : null}
    </View>
  );
}

type HarborBrandProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  style?: ViewStyle;
};

export function HarborBrand({ size = 'md', showTagline = false, style }: HarborBrandProps) {
  return (
    <View style={[styles.brandRow, style]} pointerEvents="none">
      <HarborBrandMark size={size} />
      <HarborWordmark size={size} showTagline={showTagline} />
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
