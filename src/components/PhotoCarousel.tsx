import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { colors as palette, radii, spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../i18n';
import { AnimatedPressable } from './AnimatedPressable';

type PhotoCarouselProps = {
  photos: string[];
  onAddPhoto?: () => void;
  editable?: boolean;
  height?: number;
};

export function PhotoCarousel({
  photos,
  onAddPhoto,
  editable = false,
  height = 280,
}: PhotoCarouselProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const safeIndex = photos.length > 0 ? Math.min(index, photos.length - 1) : 0;
  const currentPhoto = photos[safeIndex];

  const goPrev = () => {
    if (photos.length <= 1) {
      return;
    }
    setIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goNext = () => {
    if (photos.length <= 1) {
      return;
    }
    setIndex((prev) => (prev + 1) % photos.length);
  };

  if (photos.length === 0) {
    return (
      <View style={[styles.emptyWrap, { height }]}>
        <AnimatedPressable style={styles.empty} onPress={onAddPhoto}>
          <Ionicons name="camera" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>{t('photoCarousel.addPhoto')}</Text>
        </AnimatedPressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      <Image source={{ uri: currentPhoto }} style={styles.image} />

      {photos.length > 1 && (
        <>
          <AnimatedPressable style={styles.tapLeft} onPress={goPrev} />
          <AnimatedPressable style={styles.tapRight} onPress={goNext} />
          <View style={styles.dots}>
            {photos.map((_, dotIndex) => (
              <View
                key={dotIndex}
                style={[styles.dot, dotIndex === safeIndex && styles.dotActive]}
              />
            ))}
          </View>
        </>
      )}

      {editable && onAddPhoto && (
        <AnimatedPressable style={[styles.addButton, { backgroundColor: colors.gradientEnd }]} onPress={onAddPhoto}>
          <Ionicons name="add" size={20} color={colors.text} />
        </AnimatedPressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: palette.surface,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  tapLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '35%',
  },
  tapRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '35%',
  },
  dots: {
    position: 'absolute',
    bottom: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: palette.text,
    width: 18,
  },
  addButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: palette.gradientEnd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    width: '100%',
    alignSelf: 'stretch',
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  empty: {
    flex: 1,
    width: '100%',
    backgroundColor: palette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: '#2A2A2E',
    borderStyle: 'dashed',
    borderRadius: radii.card,
  },
  emptyText: {
    color: palette.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
});
