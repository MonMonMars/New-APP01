import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { pulseBrand } from '../../theme/pulseBrand';
import { AnimatedPressable } from '../AnimatedPressable';
import { PulseBrandMark } from './PulseBrandMark';

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
  borderColor: string;
  backgroundColor: string;
};

/** Bordered logo button — clear tap target for Spark ↔ Pulse mode switching. */
function LogoButton({
  compact = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  children,
  borderColor,
  backgroundColor,
}: LogoButtonProps) {
  const size = compact ? 40 : 44;

  return (
    <AnimatedPressable
      onPress={onPress}
      scaleTo={0.94}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      hitSlop={6}
      style={[
        styles.button,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor,
        },
      ]}
    >
      {children}
    </AnimatedPressable>
  );
}

/** Spark: tap logo to enter disguise. Pulse: tap logo to unlock Spark. */
export function ModeToggleLogo({ variant, compact = false }: ModeToggleLogoProps) {
  const { colors } = useTheme();
  const { disguiseMode, setDisguiseMode } = useApp();

  const isPulse = variant === 'pulse';
  const iconColor = isPulse ? pulseBrand.accent : colors.gradientEnd;
  const iconBg = isPulse ? pulseBrand.accentSoft : 'rgba(255,107,107,0.14)';
  const borderColor = isPulse ? pulseBrand.accentBorder : `${colors.gradientEnd}88`;

  const enterDisguise = useCallback(() => {
    void setDisguiseMode(true);
  }, [setDisguiseMode]);

  const exitDisguise = useCallback(() => {
    void setDisguiseMode(false);
  }, [setDisguiseMode]);

  if (!disguiseMode) {
    if (variant !== 'spark') {
      return <View style={[styles.placeholder, compact && styles.placeholderCompact]} />;
    }

    return (
      <LogoButton
        compact={compact}
        onPress={enterDisguise}
        borderColor={borderColor}
        backgroundColor={iconBg}
        accessibilityLabel={`Emergency — switch to ${DISGUISE_APP_NAME} disguise mode`}
        accessibilityHint="Tap to hide Spark"
      >
        <Ionicons name="flame" size={compact ? 18 : 20} color={iconColor} />
      </LogoButton>
    );
  }

  if (variant !== 'pulse') {
    return <View style={[styles.placeholder, compact && styles.placeholderCompact]} />;
  }

  return (
    <LogoButton
      compact={compact}
      onPress={exitDisguise}
      borderColor={borderColor}
      backgroundColor={iconBg}
      accessibilityLabel="Tap to unlock Spark"
      accessibilityHint="Returns to Spark dating mode"
    >
      <PulseBrandMark size={compact ? 'sm' : 'md'} />
    </LogoButton>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  placeholder: {
    width: 44,
    height: 44,
  },
  placeholderCompact: {
    width: 40,
    height: 40,
  },
});
