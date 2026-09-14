import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { DISGUISE_APP_NAME } from '../../data/disguiseFeed';
import { spacing } from '../../theme';

type ModeToggleLogoProps = {
  variant: 'pulse' | 'spark';
  title?: string;
  compact?: boolean;
};

/** Tap the top-left logo to switch between Pulse disguise mode and Spark safe mode. */
export function ModeToggleLogo({ variant, title, compact = false }: ModeToggleLogoProps) {
  const { colors } = useTheme();
  const { disguiseMode, setDisguiseMode } = useApp();

  const isPulse = variant === 'pulse';
  const label = title ?? (isPulse ? DISGUISE_APP_NAME : 'Spark');
  const icon = isPulse ? 'pulse' : 'flame';
  const iconColor = isPulse ? '#3b82f6' : colors.gradientEnd;
  const iconBg = isPulse ? 'rgba(59,130,246,0.15)' : 'rgba(255,107,107,0.14)';

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setDisguiseMode(!disguiseMode);
  };

  const modeHint = disguiseMode ? 'Switch to Spark safe mode' : `Switch to ${DISGUISE_APP_NAME} disguise mode`;

  return (
    <Pressable
      onPress={handlePress}
      style={styles.logoRow}
      accessibilityRole="button"
      accessibilityLabel={modeHint}
      accessibilityHint="Toggles between disguise mode and safe mode"
    >
      <View style={[styles.logoIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={compact ? 18 : 20} color={iconColor} />
      </View>
      <Text style={[styles.logoText, compact && styles.logoTextCompact, { color: colors.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoTextCompact: {
    fontSize: 22,
  },
});
