import { ReactNode, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandMark } from '../brand/BrandMark';
import { useApp } from '../../context/AppContext';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { resolveSparkSection } from '../../types/preferences';
import { AnimatedPressable } from '../AnimatedPressable';

type ModeToggleLogoProps = {
  variant: 'pulse' | 'spark';
  title?: string;
  compact?: boolean;
};

type LogoButtonProps = {
  compact?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
  children: ReactNode;
};

function LogoButton({
  compact = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  children,
}: LogoButtonProps) {
  const size = compact ? 36 : 40;

  return (
    <AnimatedPressable
      onPress={onPress}
      scaleTo={0.97}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={6}
      style={[styles.button, { width: size, height: size }]}
    >
      {children}
    </AnimatedPressable>
  );
}

/** Pulse P3 top-left — grey in Spark/Ember, tap to enter disguise. Hidden while disguised. */
export function PulseDisguiseLogo({ compact = false }: { compact?: boolean }) {
  const { disguiseMode, setDisguiseMode } = useApp();
  const meta = useDisguiseWorld();
  const markSize = compact ? 36 : 40;

  const enterDisguise = useCallback(() => {
    setDisguiseMode(true);
  }, [setDisguiseMode]);

  if (disguiseMode) {
    return <View style={[styles.placeholder, compact && styles.placeholderCompact]} />;
  }

  return (
    <LogoButton
      compact={compact}
      onPress={enterDisguise}
      accessibilityLabel={`Emergency — switch to ${meta.name} disguise mode`}
      accessibilityHint={`Tap to hide ${meta.unlockLabel} behind ${meta.name}`}
    >
      <BrandMark world="pulse" size={markSize} muted />
    </LogoButton>
  );
}

/** Spark S5 / Ember E1e centered while in dating mode. */
export function SectionCenterLogo({ compact = false }: { compact?: boolean }) {
  const { disguiseMode, preferences } = useApp();
  const section = resolveSparkSection(preferences.sparkSection);
  const markSize = compact ? 36 : 40;

  if (disguiseMode) {
    return null;
  }

  return (
    <View style={styles.centerMark} accessibilityRole="image" accessibilityLabel={section === 'ember' ? 'Ember' : 'Spark'}>
      <BrandMark world={section} size={markSize} />
    </View>
  );
}

/** @deprecated Use PulseDisguiseLogo (left) + SectionCenterLogo (center). */
export function ModeToggleLogo({ variant, compact = false }: ModeToggleLogoProps) {
  if (variant === 'pulse') {
    return null;
  }
  return <PulseDisguiseLogo compact={compact} />;
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerMark: {
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
