import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { resolveSparkSection } from '../types/preferences';
import { spacing } from '../theme';
import { IconButton } from './Button';
import { SparkSectionToggle } from './SparkSectionToggle';

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
  const { preferences, setSparkSection } = useApp();
  const sparkSection = resolveSparkSection(preferences.sparkSection);

  return (
    <View style={[styles.header, compact && styles.headerCompact]}>
      <View
        style={[
          styles.leftSlot,
          showLogo ? styles.leftSlotWithWorld : null,
          leftIcon && showLogo ? styles.leftSlotDual : null,
        ]}
      >
        {leftIcon ? (
          <IconButton icon={leftIcon} onPress={onLeftPress} backgroundColor={colors.surface} />
        ) : null}
        {showLogo ? (
          <SparkSectionToggle section={sparkSection} onChange={setSparkSection} variant="mark" />
        ) : null}
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
  leftSlotWithWorld: {
    width: undefined,
    flexShrink: 1,
    maxWidth: '42%',
    minWidth: 40,
  },
  leftSlotDual: {
    width: undefined,
    maxWidth: '48%',
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
