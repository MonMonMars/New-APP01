import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseMiniSparkBarProps = {
  liked: boolean;
  passed: boolean;
  sparkLinked: boolean;
  onLike: () => void;
  onUnlike: () => void;
  onPass: () => void;
};

/** Tiny Spark-style actions disguised as reader feedback on a photo. */
export function DisguiseMiniSparkBar({
  liked,
  passed,
  sparkLinked,
  onLike,
  onUnlike,
  onPass,
}: DisguiseMiniSparkBarProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.bar, { backgroundColor: 'rgba(0,0,0,0.62)', borderColor: colors.border }]}>
      <Text style={styles.caption}>
        {sparkLinked ? 'Private preview' : 'Reader feedback'}
      </Text>
      <View style={styles.actions}>
        <AnimatedPressable
          style={[
            styles.action,
            styles.passAction,
            passed && { backgroundColor: 'rgba(239,68,68,0.22)', borderColor: colors.nope },
          ]}
          onPress={onPass}
          scaleTo={0.92}
          accessibilityRole="button"
          accessibilityLabel={sparkLinked ? 'Pass profile' : 'Mark not helpful'}
        >
          <Ionicons name="close" size={16} color={passed ? colors.nope : '#fff'} />
        </AnimatedPressable>

        <AnimatedPressable
          style={[
            styles.action,
            styles.likeAction,
            liked && { backgroundColor: colors.heartRed, borderColor: colors.heartRed },
          ]}
          onPress={liked ? onUnlike : onLike}
          scaleTo={0.92}
          accessibilityRole="button"
          accessibilityLabel={liked ? 'Unlike photo' : sparkLinked ? 'Like profile' : 'Mark helpful'}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={17}
            color={liked ? '#fff' : colors.heartPink}
          />
        </AnimatedPressable>
      </View>
      <Text style={styles.hint}>
        {liked ? 'Saved to your likes' : passed ? 'Hidden from feed' : 'Tap heart to like · X to pass'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    gap: 6,
  },
  caption: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  action: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  passAction: {
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  likeAction: {
    borderColor: 'rgba(255,107,107,0.65)',
    backgroundColor: 'rgba(255,107,107,0.15)',
  },
  hint: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 10,
    fontWeight: '500',
  },
});
