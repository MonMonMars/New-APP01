import { StyleSheet, View } from 'react-native';

import { BrandMark } from '../brand/BrandMark';
import { useTranslation } from '../../i18n';
import { useApp } from '../../context/AppContext';
import { resolveSparkSection } from '../../types/preferences';

type ModeToggleLogoProps = {
  variant: 'pulse' | 'spark';
  title?: string;
  compact?: boolean;
};

/** Pulse P mark — lower-left tab bar in Spark/Ember (matches other tab icons). */
export function PulseTabIcon({
  size = 24,
  focused = false,
}: {
  size?: number;
  focused?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <View accessibilityRole="image" accessibilityLabel={t('tabs.pulse')}>
      <BrandMark world="pulse" size={size} muted={!focused} />
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
  const section = resolveSparkSection(preferences.sparkSection);
  const markSize = compact ? 36 : 40;

  if (disguiseMode) {
    return null;
  }

  return (
    <View
      style={styles.leftMark}
      accessibilityRole="image"
      accessibilityLabel={section === 'ember' ? 'Ember' : 'Spark'}
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
