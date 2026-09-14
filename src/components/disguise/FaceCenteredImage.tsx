import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import { cropToImageLayout, getFaceCrop, type FaceCrop } from '../../utils/faceThumbnailCenter';

type FaceCenteredImageProps = {
  imageUrl: string;
  size: number;
  style?: ViewStyle;
};

const INITIAL_CROP: FaceCrop = { focal: { x: 0.5, y: 0.32 }, scale: 1.55 };

export function FaceCenteredImage({ imageUrl, size, style }: FaceCenteredImageProps) {
  const radius = size / 2;
  const [crop, setCrop] = useState<FaceCrop>(INITIAL_CROP);

  useEffect(() => {
    let cancelled = false;
    void getFaceCrop(imageUrl).then((next) => {
      if (!cancelled) {
        setCrop(next);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  const layout = cropToImageLayout(crop, size);

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: radius },
        style,
      ]}
    >
      <Image
        source={{ uri: imageUrl }}
        style={[
          styles.image,
          {
            width: layout.width,
            height: layout.height,
            left: layout.left,
            top: layout.top,
          },
        ]}
        contentFit="cover"
        transition={160}
        accessibilityIgnoresInvertColors
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  image: {
    position: 'absolute',
  },
});
