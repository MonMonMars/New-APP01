import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguiseMiniPhotoPagerProps = {
  photos: string[];
  index: number;
  onIndexChange: (index: number) => void;
  height?: number;
};

/** Mini-window photos — chevron taps on the image, no drag. */
export function DisguiseMiniPhotoPager({
  photos,
  index,
  onIndexChange,
  height = 96,
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
        <Ionicons name="image-outline" size={22} color={colors.textMuted} />
      </View>
    );
  }

  return (
    <View style={[styles.lane, { height }]}>
      <Image
        source={{ uri: currentUri }}
        style={styles.image}
        contentFit="cover"
        transition={120}
        accessibilityLabel={
          multiPhoto ? `Photo ${safeIndex + 1} of ${photos.length}` : 'Profile photo'
        }
      />

      {multiPhoto ? (
        <>
          <AnimatedPressable
            onPress={goPrev}
            style={[styles.navButton, styles.navLeft]}
            accessibilityLabel="Previous photo"
            scaleTo={0.9}
          >
            <Ionicons name="chevron-back" size={14} color="#fff" />
          </AnimatedPressable>
          <AnimatedPressable
            onPress={goNext}
            style={[styles.navButton, styles.navRight]}
            accessibilityLabel="Next photo"
            scaleTo={0.9}
          >
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </AnimatedPressable>
          <View style={styles.dots} pointerEvents="none">
            {photos.map((_, dotIndex) => (
              <View
                key={dotIndex}
                style={[styles.dot, dotIndex === safeIndex && styles.dotActive]}
              />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lane: {
    width: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#111',
    position: 'relative',
    marginTop: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  navLeft: {
    left: 8,
  },
  navRight: {
    right: 8,
  },
  dots: {
    position: 'absolute',
    bottom: 8,
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
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
});
