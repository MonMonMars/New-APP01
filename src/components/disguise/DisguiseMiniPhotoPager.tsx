import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { radii, spacing } from '../../theme';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseMiniPhotoPagerProps = {
  photos: string[];
  index: number;
  onIndexChange: (index: number) => void;
  height?: number;
};

/** Mini-window photos — chevron taps only, no drag or swipe. */
export function DisguiseMiniPhotoPager({
  photos,
  index,
  onIndexChange,
  height = 156,
}: DisguiseMiniPhotoPagerProps) {
  const { colors } = useTheme();
  const safeIndex = photos.length > 0 ? Math.min(index, photos.length - 1) : 0;
  const multiPhoto = photos.length > 1;
  const currentUri = photos[safeIndex];

  const goPrev = () => {
    if (!multiPhoto) {
      return;
    }
    onIndexChange((safeIndex - 1 + photos.length) % photos.length);
  };

  const goNext = () => {
    if (!multiPhoto) {
      return;
    }
    onIndexChange((safeIndex + 1) % photos.length);
  };

  if (photos.length === 0 || !currentUri) {
    return (
      <View style={[styles.empty, { height, backgroundColor: colors.surface }]}>
        <Ionicons name="image-outline" size={28} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <View style={[styles.row, { height }]}>
      {multiPhoto ? (
        <AnimatedPressable
          onPress={goPrev}
          style={styles.navButton}
          accessibilityLabel="Previous photo"
          scaleTo={0.9}
        >
          <Ionicons name="chevron-back" size={20} color={colors.textMuted} />
        </AnimatedPressable>
      ) : null}

      <View style={styles.lane}>
        <Image
          source={{ uri: currentUri }}
          style={styles.image}
          contentFit="contain"
          transition={120}
          accessibilityLabel={
            multiPhoto ? `Photo ${safeIndex + 1} of ${photos.length}` : 'Profile photo'
          }
        />

        {multiPhoto ? (
          <View style={styles.dots} pointerEvents="none">
            {photos.map((_, dotIndex) => (
              <View
                key={dotIndex}
                style={[styles.dot, dotIndex === safeIndex && styles.dotActive]}
              />
            ))}
          </View>
        ) : null}
      </View>

      {multiPhoto ? (
        <AnimatedPressable
          onPress={goNext}
          style={styles.navButton}
          accessibilityLabel="Next photo"
          scaleTo={0.9}
        >
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </AnimatedPressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  navButton: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
  },
  lane: {
    flex: 1,
    borderRadius: radii.card - 2,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
    minWidth: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dots: {
    position: 'absolute',
    bottom: 6,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  dotActive: {
    width: 14,
    backgroundColor: '#fff',
  },
  empty: {
    flex: 1,
    borderRadius: radii.card - 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xs,
  },
});
