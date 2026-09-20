import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '../brand/BrandMark';
import { useTranslation } from '../../i18n';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { resolveSparkSection } from '../../types/preferences';
import { pulseTimesFontFamily } from '../../theme/pulseBrand';

type ModeToggleLogoProps = {
  variant: 'pulse' | 'spark';
  title?: string;
  compact?: boolean;
};

/** Pulse P mark — lower-left tab; tints Spark pink or Ember amber (not disguise blue). */
export function PulseTabIcon({
  size = 24,
  focused = false,
}: {
  size?: number;
  focused?: boolean;
}) {
  const { t } = useTranslation();
  const { preferences } = useApp();
  const { colors } = useTheme();
  const section = resolveSparkSection(preferences.sparkSection);
  const accent = section === 'ember' ? colors.ember : colors.gradientEnd;
  const onAccent = section === 'ember' ? colors.text : '#ffffff';

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={t('tabs.pulse')}
      style={[styles.pulseTabOuter, { width: size, height: size }]}
    >
      <View
        style={[
          styles.pulseTabInner,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: focused ? accent : 'transparent',
            borderColor: focused ? accent : colors.textMuted,
          },
        ]}
      >
        <Text
          style={[
            styles.pulseTabLetter,
            {
              fontSize: Math.round(size * 0.52),
              color: focused ? onAccent : colors.textMuted,
            },
          ]}
        >
          P
        </Text>
      </View>
    </View>
  );
}

/** @deprecated Pulse entry is tab-bar only — use PulseTabIcon. */
export function PulseDisguiseWordmark({ markSize = 22 }: { markSize?: number; focused?: boolean }) {
  return <PulseTabIcon size={markSize} />;
}

/** @deprecated Pulse entry is tab-bar only. */
export function PulseDisguiseLogo({ compact = false }: { compact?: boolean }) {
  return <View style={[styles.placeholder, compact && styles.placeholderCompact]} />;
}

/** Spark S5 / Ember E1e — top-left brand mark in dating mode. */
export function SectionLeftLogo({ compact = false }: { compact?: boolean }) {
  const { disguiseMode, preferences } = useApp();
  const { t } = useTranslation();
  const section = resolveSparkSection(preferences.sparkSection);
  const markSize = compact ? 36 : 40;

  if (disguiseMode) {
    return null;
  }

  return (
    <View
      style={styles.leftMark}
      accessibilityRole="image"
      accessibilityLabel={section === 'ember' ? t('preferences.ember') : t('preferences.spark')}
    >
      <BrandMark world={section} size={markSize} />
    </View>
  );
}

/** @deprecated Use SectionLeftLogo. */
export function SectionCenterLogo({ compact = false }: { compact?: boolean }) {
  return <SectionLeftLogo compact={compact} />;
}

/** @deprecated Use PulseTabIcon / SectionLeftLogo. */
export function ModeToggleLogo({ variant, compact = false }: ModeToggleLogoProps) {
  if (variant === 'pulse') {
    return null;
  }
  return <SectionLeftLogo compact={compact} />;
}

const styles = StyleSheet.create({
  pulseTabOuter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseTabInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  pulseTabLetter: {
    fontFamily: pulseTimesFontFamily,
    fontWeight: '600',
    marginTop: -1,
  },
  leftMark: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  placeholderCompact: {
    width: 36,
    height: 36,
  },
});
