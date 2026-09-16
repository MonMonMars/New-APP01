import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
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
  borderColor: string;
  backgroundColor: string;
};

/** Bordered logo button — clear tap target for Spark/Ember ↔ disguise switching. */
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

/** Spark/Ember: tap logo to enter that world’s disguise. Pulse header uses DisguiseBrand instead. */
export function ModeToggleLogo({ variant, compact = false }: ModeToggleLogoProps) {
  const { colors } = useTheme();
  const { disguiseMode, setDisguiseMode, preferences } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection);
  const isEmber = meta.world === 'harbor';

  const iconColor = isEmber ? colors.ember : colors.gradientEnd;
  const iconBg = isEmber ? 'rgba(255,176,32,0.16)' : 'rgba(255,107,107,0.14)';
  const borderColor = isEmber ? `${colors.ember}88` : `${colors.gradientEnd}88`;

  const enterDisguise = useCallback(() => {
    void setDisguiseMode(true);
  }, [setDisguiseMode]);

  if (disguiseMode || variant !== 'spark') {
    return <View style={[styles.placeholder, compact && styles.placeholderCompact]} />;
  }

  return (
    <LogoButton
      compact={compact}
      onPress={enterDisguise}
      borderColor={borderColor}
      backgroundColor={iconBg}
      accessibilityLabel={`Emergency — switch to ${meta.name} disguise mode`}
      accessibilityHint={`Tap to hide ${meta.unlockLabel} behind ${meta.name}`}
    >
      <Ionicons name={isEmber ? 'bonfire' : 'flame'} size={compact ? 18 : 20} color={iconColor} />
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
