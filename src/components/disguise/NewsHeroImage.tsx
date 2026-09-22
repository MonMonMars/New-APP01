import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { newsHeroFallbackUri } from '../../utils/pulseNewsHeroImage';

type NewsHeroImageProps = {
  uri: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** News photo that always fills its frame — a 404 never leaves a black hole in Pulse. */
export function NewsHeroImage({ uri, style, accessibilityLabel }: NewsHeroImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const src = failed || !uri ? newsHeroFallbackUri(uri || 'pulse-news') : uri;

  return (
    <View style={[styles.frame, style]}>
      <Image
        source={{ uri: src }}
        style={styles.image}
        contentFit="cover"
        recyclingKey={src}
        transition={120}
        accessibilityLabel={accessibilityLabel}
        onError={() => {
          if (!failed) {
            setFailed(true);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: '#1A1A1C',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
