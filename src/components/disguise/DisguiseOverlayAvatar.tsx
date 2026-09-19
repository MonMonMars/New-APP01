import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { hexToRgba } from '../../utils/disguiseWorld';
import { useTranslation } from '../../i18n';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { FaceCenteredImage } from './FaceCenteredImage';

export type DisguiseOverlayVariant = 'news' | 'ad';

export const PROFILE_AVATAR_SIZE = 48;

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
  size = PROFILE_AVATAR_SIZE,
  badgeOnly = false,
}: DisguiseOverlayAvatarProps) {
  const { t } = useTranslation();
  const meta = useDisguiseWorld();
  const radius = size / 2;
  const isNews = variant === 'news';
  const navyScrim = hexToRgba(meta.navy, 0.78);

  return (
    <View
      style={[
        styles.wrap,
        {
          width: size,
          height: size,
          borderRadius: radius,
          borderColor: meta.accent,
        },
      ]}
    >
      <FaceCenteredImage imageUrl={imageUrl} size={size} />

      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0)', navyScrim]}
        locations={[0, 0.52, 1]}
        style={[styles.bottomScrim, { borderRadius: radius }]}
      />

      <View style={styles.badgeStrip}>
        {isNews ? (
          <>
            <Text style={[styles.newsBadge, { color: meta.accentBright }]}>{t('disguiseOverlay.breaking')}</Text>
            {!badgeOnly && (
              <Text
                style={styles.newsText}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.55}
              >
                {overlayText}
              </Text>
            )}
          </>
        ) : (
          <>
            <Text style={[styles.adBadge, { color: meta.accentBright }]}>{t('disguiseOverlay.adBadge')}</Text>
            {!badgeOnly && (
              <Text
                style={styles.adText}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.55}
              >
                {overlayText}
              </Text>
            )}
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
  },
  bottomScrim: {
    ...StyleSheet.absoluteFill,
  },
  badgeStrip: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
    paddingBottom: 3,
    minHeight: '38%',
  },
  newsBadge: {
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.35,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 2,
  },
  newsText: {
    color: '#fff',
    fontSize: 5.5,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 6.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  adBadge: {
    fontSize: 6,
    fontWeight: '900',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 0.5 },
    textShadowRadius: 2,
  },
  adText: {
    color: '#fff',
    fontSize: 5.5,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 6.5,
    textTransform: 'uppercase',
    marginTop: 1,
  },
});
