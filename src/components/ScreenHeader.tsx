import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme';
import { IconButton } from './Button';
import { SectionLeftLogo } from './disguise/ModeToggleLogo';

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
  const { colors } = useTheme();

  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View
        style={[
          styles.leftSlot,
          leftIcon && showLogo ? styles.leftSlotDual : null,
        ]}
      >
        {leftIcon ? (
          <IconButton icon={leftIcon} onPress={onLeftPress} backgroundColor={colors.surface} />
        ) : null}
        {showLogo ? <SectionLeftLogo compact={compact} /> : null}
        {!leftIcon && !showLogo ? <View style={styles.iconButtonPlaceholder} /> : null}
      </View>

      <View style={styles.centerSlot}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <View style={styles.rightGroup}>
        {secondaryRightIcon ? (
          <IconButton
            icon={secondaryRightIcon}
            iconSize={20}
            color={colors.textMuted}
            onPress={onSecondaryRightPress}
            backgroundColor={colors.surface}
          />
        ) : null}
        {rightIcon ? (
          <IconButton icon={rightIcon} onPress={onRightPress} backgroundColor={colors.surface} />
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
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  headerCompact: {
    paddingBottom: spacing.xs,
  },
  leftSlot: {
    width: 40,
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftSlotDual: {
    width: 84,
    gap: spacing.xs,
  },
  centerSlot: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  iconButtonPlaceholder: {
    width: 40,
    height: 40,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexShrink: 0,
  },
});
