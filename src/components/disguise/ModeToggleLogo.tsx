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

/** Brand-tile tap target for Spark/Ember ↔ disguise switching. */
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

/** Spark/Ember: tap the S5 / E1e mark to enter that world’s disguise. */
export function ModeToggleLogo({ variant, compact = false }: ModeToggleLogoProps) {
  const { disguiseMode, setDisguiseMode, preferences } = useApp();
  const meta = useDisguiseWorld();
  const section = resolveSparkSection(preferences.sparkSection);
  const markSize = compact ? 36 : 40;

  const enterDisguise = useCallback(() => {
    setDisguiseMode(true);
  }, [setDisguiseMode]);

  if (disguiseMode || variant !== 'spark') {
    return <View style={[styles.placeholder, compact && styles.placeholderCompact]} />;
  }

  return (
    <LogoButton
      compact={compact}
      onPress={enterDisguise}
      accessibilityLabel={`Emergency — switch to ${meta.name} disguise mode`}
      accessibilityHint={`Tap to hide ${meta.unlockLabel} behind ${meta.name}`}
    >
      <BrandMark world={section} size={markSize} />
    </LogoButton>
  );
}

const styles = StyleSheet.create({
  button: {
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
