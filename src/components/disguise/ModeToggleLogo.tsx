import { Ionicons } from '@expo/vector-icons';
import { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { AnimatedPressable } from '../AnimatedPressable';

type ModeToggleLogoProps = {
  variant: 'pulse' | 'spark';
  title?: string;
  compact?: boolean;
};

type LogoButtonProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  borderColor: string;
  compact?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  accessibilityHint: string;
};

/** Bordered logo button — clear tap target for Spark ↔ Pulse mode switching. */
function LogoButton({
  icon,
  iconColor,
  iconBg,
  borderColor,
  compact = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
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
          backgroundColor: iconBg,
          borderColor,
        },
      ]}
    >
      <Ionicons name={icon} size={compact ? 18 : 20} color={iconColor} />
    </AnimatedPressable>
  );
}

/** Spark: tap logo to enter disguise. Pulse: tap logo to unlock Spark. */
export function ModeToggleLogo({ variant, compact = false }: ModeToggleLogoProps) {
  const { colors } = useTheme();
  const { disguiseMode, setDisguiseMode } = useApp();

  const isPulse = variant === 'pulse';
  const icon = isPulse ? 'pulse' : 'flame';
  const iconColor = isPulse ? '#3b82f6' : colors.gradientEnd;
  const iconBg = isPulse ? 'rgba(59,130,246,0.14)' : 'rgba(255,107,107,0.14)';
  const borderColor = isPulse ? 'rgba(59,130,246,0.55)' : `${colors.gradientEnd}88`;

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
        icon={icon}
        iconColor={iconColor}
        iconBg={iconBg}
        borderColor={borderColor}
        compact={compact}
        onPress={enterDisguise}
        accessibilityLabel={`Emergency — switch to ${DISGUISE_APP_NAME} disguise mode`}
        accessibilityHint="Tap to hide Spark"
      />
    );
  }

  if (variant !== 'pulse') {
    return <View style={[styles.placeholder, compact && styles.placeholderCompact]} />;
  }

  return (
    <LogoButton
      icon={icon}
      iconColor={iconColor}
      iconBg={iconBg}
      borderColor={borderColor}
      compact={compact}
      onPress={exitDisguise}
      accessibilityLabel="Tap to unlock Spark"
      accessibilityHint="Returns to Spark dating mode"
    />
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
