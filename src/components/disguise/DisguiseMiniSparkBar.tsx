import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme';

type DisguiseMiniSparkBarProps = {
  liked: boolean;
  superLiked: boolean;
  passed: boolean;
  sparkLinked: boolean;
  onLike: () => void;
  onUnlike: () => void;
  onSuperLike: () => void;
  onPass: () => void;
};

/** Compact pass / like / super-like row — plain buttons, no animations. */
export function DisguiseMiniSparkBar({
  liked,
  superLiked,
  passed,
  sparkLinked,
  onLike,
  onUnlike,
  onSuperLike,
  onPass,
}: DisguiseMiniSparkBarProps) {
  const { colors } = useTheme();

  if (!sparkLinked) {
    return null;
  }

  return (
    <View style={styles.bar}>
      <Pressable
        style={[styles.action, styles.passAction, passed && styles.passActive]}
        onPress={onPass}
        accessibilityRole="button"
        accessibilityLabel="Pass profile"
      >
        <Ionicons name="close" size={15} color={passed ? colors.nope : colors.textMuted} />
      </Pressable>

      <Pressable
        style={[styles.action, styles.likeAction, liked && styles.likeActive]}
        onPress={liked ? onUnlike : onLike}
        accessibilityRole="button"
        accessibilityLabel={liked ? 'Unlike profile' : 'Like profile'}
      >
        <Ionicons
          name={liked ? 'heart' : 'heart-outline'}
          size={16}
          color={liked ? '#fff' : colors.heartPink}
        />
      </Pressable>

      <Pressable
        style={[styles.action, styles.superAction, superLiked && styles.superActive]}
        onPress={onSuperLike}
        accessibilityRole="button"
        accessibilityLabel="Super like profile"
      >
        <Ionicons
          name="star"
          size={15}
          color={superLiked ? '#fff' : colors.superLike}
        />
      </Pressable>
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
  action: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  passAction: {
    borderColor: 'rgba(128,128,128,0.35)',
    backgroundColor: 'rgba(128,128,128,0.08)',
  },
  passActive: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  likeAction: {
    borderColor: 'rgba(255,107,107,0.45)',
    backgroundColor: 'rgba(255,107,107,0.08)',
  },
  likeActive: {
    borderColor: '#ff6b6b',
    backgroundColor: '#ff6b6b',
  },
  superAction: {
    borderColor: 'rgba(30,195,255,0.45)',
    backgroundColor: 'rgba(30,195,255,0.08)',
  },
  superActive: {
    borderColor: '#1EC3FF',
    backgroundColor: '#1EC3FF',
  },
});
