import { Image, StyleSheet, Text, View } from 'react-native';

import { radii } from '../../theme';
import { DisguiseOverlayVariant } from './DisguiseOverlayAvatar';

type DisguiseOverlayImageProps = {
  imageUrl: string;
  overlayText: string;
  variant: DisguiseOverlayVariant;
  height?: number;
};

/** Full-width post image with news/ad text plastered over faces. */
export function DisguiseOverlayImage({
  imageUrl,
  overlayText,
  variant,
  height = 200,
}: DisguiseOverlayImageProps) {
  return (
    <View style={[styles.wrap, { height }]}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={[styles.scrim, variant === 'news' ? styles.scrimNews : styles.scrimAd]} />
      {variant === 'news' ? (
        <View style={styles.newsBanner}>
          <Text style={styles.newsKicker}>EXCLUSIVE</Text>
          <Text style={styles.newsHeadline} numberOfLines={2}>
            {overlayText}
          </Text>
        </View>
      ) : (
        <View style={styles.adBanner}>
          <Text style={styles.adKicker}>LIMITED OFFER</Text>
          <Text style={styles.adHeadline} numberOfLines={2}>
            {overlayText}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    borderRadius: radii.card,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scrim: {
    ...StyleSheet.absoluteFill,
  },
  scrimNews: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  scrimAd: {
    backgroundColor: 'rgba(0, 30, 90, 0.35)',
  },
  newsBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '32%',
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  adBanner: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '30%',
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  newsKicker: {
    color: '#fde047',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  newsHeadline: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 26,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  adKicker: {
    color: '#86efac',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 4,
  },
  adHeadline: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 28,
    textTransform: 'uppercase',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
