import { ReactNode, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '../brand/BrandMark';
import { useApp } from '../../context/AppContext';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { pulseTimesFontFamily } from '../../theme/pulseBrand';
import { resolveSparkSection } from '../../types/preferences';
import { useTheme } from '../../context/ThemeContext';
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

/** Grey P + “Pulse” wordmark — lower-left tab bar entry in Spark/Ember. */
export function PulseDisguiseWordmark({ markSize = 22 }: { markSize?: number }) {
  const { colors } = useTheme();
  const wordSize = Math.max(11, Math.round(markSize * 0.58));

  return (
    <View style={styles.wordmarkRow} accessibilityRole="image" accessibilityLabel="Pulse">
      <BrandMark world="pulse" size={markSize} muted />
      <Text
        style={[
          styles.pulseWord,
          {
            fontSize: wordSize,
            lineHeight: wordSize + 2,
            color: colors.textMuted,
            fontFamily: pulseTimesFontFamily,
          },
        ]}
      >
        Pulse
      </Text>
    </View>
  );
}

/** Pulse P3 top-left — grey P only in Spark/Ember, tap to enter disguise. Hidden while disguised. */
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
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pulseWord: {
    fontWeight: '600',
    letterSpacing: -0.2,
  },
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
