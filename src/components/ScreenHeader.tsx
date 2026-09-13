import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';

type ScreenHeaderProps = {
  title?: string;
  showLogo?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

export function ScreenHeader({
  title,
  showLogo = false,
  rightIcon,
  onRightPress,
}: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      {showLogo ? (
        <View style={styles.logoRow}>
          <Ionicons name="flame" size={28} color={colors.gradientEnd} />
          <Text style={styles.logo}>Spark</Text>
        </View>
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
      {rightIcon ? (
        <Pressable style={styles.iconButton} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={22} color={colors.text} />
        </Pressable>
      ) : (
        <View style={styles.iconButtonPlaceholder} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
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
});
