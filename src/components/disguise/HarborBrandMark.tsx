import { StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { harborBrand } from '../../theme/harborBrand';

type HarborBrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
};

const SIZE_PX = { sm: 28, md: 34, lg: 40 } as const;
const RADIUS = { sm: 7, md: 8, lg: 10 } as const;
const LETTER = { sm: 16, md: 20, lg: 24 } as const;
const PIP = { sm: 6, md: 7, lg: 8 } as const;

/** Harbor logomark — Ember’s discreet markets/briefing cover. */
export function HarborBrandMark({ size = 'md', style }: HarborBrandMarkProps) {
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
          backgroundColor: isDark ? harborBrand.navyMuted : harborBrand.navy,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel="Harbor"
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
        H
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
    <View style={[styles.brandRow, style]}>
      <HarborBrandMark size={size} />
      <HarborWordmark size={size} showTagline={showTagline} />
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
  },
  pip: {
    position: 'absolute',
    backgroundColor: harborBrand.accentBright,
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
