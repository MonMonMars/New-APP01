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

/** Compact pass / like / super-like row with spring press + active pop. */
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
      <SparkIconButton
        icon="close"
        iconSize={15}
        color={passed ? colors.nope : colors.textMuted}
        active={passed}
        activeBackground="rgba(239,68,68,0.18)"
        activeBorder={colors.nope}
        idleBackground="rgba(128,128,128,0.08)"
        idleBorder="rgba(128,128,128,0.35)"
        onPress={onPass}
        accessibilityLabel="Pass profile"
      />

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

      <SparkIconButton
        icon="star"
        iconSize={15}
        color={superLiked ? '#fff' : colors.superLike}
        active={superLiked}
        activeBackground={colors.superLike}
        activeBorder={colors.superLike}
        idleBackground="rgba(30,195,255,0.08)"
        idleBorder="rgba(30,195,255,0.45)"
        onPress={onSuperLike}
        accessibilityLabel="Super like profile"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
});
