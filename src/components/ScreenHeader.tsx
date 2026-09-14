import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

type ScreenHeaderProps = {
  title?: string;
  showLogo?: boolean;
  compact?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  onLeftPress?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
  secondaryRightIcon?: keyof typeof Ionicons.glyphMap;
  onSecondaryRightPress?: () => void;
};

export function ScreenHeader({
  title,
  showLogo = false,
  compact = false,
  leftIcon,
  onLeftPress,
  rightIcon,
  onRightPress,
  secondaryRightIcon,
  onSecondaryRightPress,
}: ScreenHeaderProps) {
  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      {leftIcon ? (
        <Pressable style={styles.iconButton} onPress={onLeftPress}>
          <Ionicons name={leftIcon} size={22} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconButtonPlaceholder} />
      )}

      {showLogo ? (
        <View style={styles.logoRow}>
          <Ionicons name="flame" size={compact ? 22 : 28} color={colors.gradientEnd} />
          <Text style={[styles.logo, compact && styles.logoCompact]}>Spark</Text>
        </View>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}

      <View style={styles.rightGroup}>
        {secondaryRightIcon ? (
          <Pressable style={styles.iconButton} onPress={onSecondaryRightPress}>
            <Ionicons name={secondaryRightIcon} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
        {rightIcon ? (
          <Pressable style={styles.iconButton} onPress={onRightPress}>
            <Ionicons name={rightIcon} size={22} color={colors.text} />
          </Pressable>
        ) : (
          <View style={styles.iconButtonPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerCompact: {
    paddingBottom: spacing.xs,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logo: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  logoCompact: {
    fontSize: 22,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
