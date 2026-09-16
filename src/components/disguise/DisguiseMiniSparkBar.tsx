import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';
import { SparkIconButton } from '../motion/ScalePressable';

type DisguiseMiniSparkBarProps = {
  liked: boolean;
  superLiked: boolean;
  passed: boolean;
  onLike: () => void;
  onUnlike: () => void;
  onSuperLike: () => void;
  onPass: () => void;
};

/** Compact pass / super-like / like row. Super-like sits in the middle. */
export function DisguiseMiniSparkBar({
  liked,
  superLiked,
  passed,
  onLike,
  onUnlike,
  onSuperLike,
  onPass,
}: DisguiseMiniSparkBarProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.bar}>
      <View style={styles.slot}>
        <SparkIconButton
          icon="close"
          iconSize={16}
          color={passed ? colors.nope : colors.textMuted}
          active={passed}
          activeBackground="rgba(239,68,68,0.18)"
          activeBorder={colors.nope}
          idleBackground="rgba(128,128,128,0.08)"
          idleBorder="rgba(128,128,128,0.35)"
          onPress={onPass}
          accessibilityLabel="Pass profile"
        />
      </View>

      <View style={styles.centerSlot}>
        <SparkIconButton
          icon="star"
          iconSize={20}
          color={superLiked ? '#fff' : colors.superLike}
          active={superLiked}
          activeBackground={colors.superLike}
          activeBorder={colors.superLike}
          idleBackground="rgba(30,195,255,0.12)"
          idleBorder="rgba(30,195,255,0.55)"
          onPress={onSuperLike}
          accessibilityLabel="Super like profile"
          size={48}
        />
      </View>

      <View style={styles.slot}>
        <SparkIconButton
          icon={liked ? 'heart' : 'heart-outline'}
          iconSize={16}
          color={liked ? '#fff' : colors.heartPink}
          active={liked}
          activeBackground={colors.heartRed}
          activeBorder={colors.heartRed}
          idleBackground="rgba(255,107,107,0.08)"
          idleBorder="rgba(255,107,107,0.45)"
          onPress={liked ? onUnlike : onLike}
          accessibilityLabel={liked ? 'Unlike profile' : 'Like profile'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    zIndex: 4,
  },
  slot: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
