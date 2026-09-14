import { StyleSheet, Text, View } from 'react-native';

import { FaceCenteredImage } from './FaceCenteredImage';

export type DisguiseOverlayVariant = 'news' | 'ad';

type DisguiseOverlayAvatarProps = {
  imageUrl: string;
  overlayText: string;
  variant: DisguiseOverlayVariant;
  size?: number;
  /** When true, only the BREAKING/AD badge sits on the circle; caption goes beside it in the parent. */
  badgeOnly?: boolean;
};

export function DisguiseOverlayAvatar({
  imageUrl,
  overlayText,
  variant,
  size = 40,
  badgeOnly = false,
}: DisguiseOverlayAvatarProps) {
  const radius = size / 2;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: radius }]}>
      <FaceCenteredImage imageUrl={imageUrl} size={size} />
      <View
        style={[
          styles.scrim,
          variant === 'news' ? styles.scrimNews : styles.scrimAd,
          { borderRadius: radius },
        ]}
      />
      {variant === 'news' ? (
        <View style={styles.newsStack}>
          <Text style={styles.newsBadge}>BREAKING</Text>
          {!badgeOnly && (
            <Text
              style={styles.newsText}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {overlayText}
            </Text>
          )}
        </View>
      ) : (
        <View style={styles.adStack}>
          <Text style={styles.adBadge}>AD</Text>
          {!badgeOnly && (
            <Text
              style={styles.adText}
              numberOfLines={3}
              adjustsFontSizeToFit
              minimumFontScale={0.6}
            >
              {overlayText}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    position: 'relative',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  scrimNews: {
    backgroundColor: 'rgba(120, 0, 0, 0.55)',
  },
  scrimAd: {
    backgroundColor: 'rgba(0, 40, 120, 0.6)',
  },
  newsStack: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  adStack: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  newsBadge: {
    color: '#fde047',
    fontSize: 5,
    fontWeight: '900',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  newsText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 8,
    textTransform: 'uppercase',
  },
  adBadge: {
    color: '#86efac',
    fontSize: 5,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  adText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 8,
    textTransform: 'uppercase',
  },
});
