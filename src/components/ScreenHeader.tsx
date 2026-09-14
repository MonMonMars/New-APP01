import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../context/ThemeContext';
import { spacing } from '../theme';
import { IconButton } from './Button';
import { DisguiseModeButton } from './disguise/ModeToggleButtons';
import { ModeToggleLogo } from './disguise/ModeToggleLogo';

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
  showDisguiseButton?: boolean;
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
  showDisguiseButton = false,
}: ScreenHeaderProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View style={styles.leftSlot}>
        {leftIcon ? (
          <IconButton icon={leftIcon} onPress={onLeftPress} backgroundColor={colors.surface} />
        ) : (
          <View style={styles.iconButtonPlaceholder} />
        )}
      </View>

      <View style={styles.centerSlot}>
        {showLogo ? (
          <ModeToggleLogo variant="spark" compact={compact} />
        ) : (
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {title}
          </Text>
        )}
      </View>

      <View style={styles.rightGroup}>
        {showDisguiseButton ? <DisguiseModeButton /> : null}
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
