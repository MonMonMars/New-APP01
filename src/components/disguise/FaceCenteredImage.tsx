import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';

import {
  focalToContentPosition,
  getFaceFocalPoint,
  type FaceFocalPoint,
} from '../../utils/faceThumbnailCenter';

type FaceCenteredImageProps = {
  imageUrl: string;
  size: number;
  style?: ViewStyle;
};

export function FaceCenteredImage({ imageUrl, size, style }: FaceCenteredImageProps) {
  const radius = size / 2;
  const [focal, setFocal] = useState<FaceFocalPoint>({ x: 0.5, y: 0.38 });

  useEffect(() => {
    let cancelled = false;
    void getFaceFocalPoint(imageUrl).then((point) => {
      if (!cancelled) {
        setFocal(point);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  const position = focalToContentPosition(focal);

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
        style={[styles.image, { borderRadius: radius }]}
        contentFit="cover"
        contentPosition={position}
        transition={120}
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
    width: '100%',
    height: '100%',
  },
});
