import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { AI_PERSONA_IDS, mockProfiles } from '../../data/profiles';
import { AdPost } from '../../data/disguiseFeed';
import { disguiseDisplayName } from '../../utils/disguiseProfileFeed';
import { profileIntroCaption } from '../../utils/profileIntroCaption';
import { radii, spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { ContentTypeIcon, MediaWithContentBadge } from './ContentTypeIcon';
import { FeedPersonThumbnail } from './FeedPersonThumbnail';
import { AdLandingSheet } from './AdLandingSheet';
import { pulseFeedCardShell } from './pulseFeedCardLayout';
import { AnimatedPressable } from '../AnimatedPressable';

const AD_TESTIMONIAL_PROFILES = mockProfiles.filter(
  (profile) => !AI_PERSONA_IDS.has(profile.id) && !profile.isAiPersona && profile.photos.length > 0,
);

type AdBannerCardProps = {
  ad: AdPost;
};

export function AdBannerCard({ ad }: AdBannerCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const meta = useDisguiseWorld();
  const [sheetOpen, setSheetOpen] = useState(false);
  const testimonialProfile =
    AD_TESTIMONIAL_PROFILES[ad.id.length % AD_TESTIMONIAL_PROFILES.length] ?? AD_TESTIMONIAL_PROFILES[0];
  const testimonialReporter = testimonialProfile
    ? {
        id: `ad-testimonial-${testimonialProfile.id}`,
        name: disguiseDisplayName(testimonialProfile.name),
        avatarUrl: testimonialProfile.photos[0],
        quote: profileIntroCaption(testimonialProfile),
        photos: testimonialProfile.photos,
        profileId: testimonialProfile.id,
      }
    : null;

  return (
    <>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={t('adBanner.sponsoredA11y', { brand: ad.brand })}
        onPress={() => setSheetOpen(true)}
        style={[styles.card, pulseFeedCardShell, { backgroundColor: '#1a1a2e', borderColor: colors.border }]}
      >
        <View style={styles.sponsoredRow}>
          <Text style={styles.sponsored}>{t('disguiseAd.sponsored')}</Text>
          <ContentTypeIcon kind="sponsored" />
        </View>
        <MediaWithContentBadge kind="ad">
          <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" />
        </MediaWithContentBadge>
        <View style={styles.body}>
          <Text style={styles.brand}>{ad.brand}</Text>
          <Text style={styles.tagline}>{ad.tagline}</Text>
          {testimonialReporter ? (
            <View style={styles.testimonialRow} accessibilityLabel={t('adBanner.sponsoredA11y', { brand: ad.brand })}>
              <FeedPersonThumbnail
                plainAvatar
                contentKind="sponsored"
                imageUrl={testimonialReporter.avatarUrl}
                caption={testimonialReporter.quote}
                accessibilityLabel={testimonialReporter.name}
              />
            </View>
          ) : null}
          <View style={[styles.cta, { backgroundColor: meta.accent }]}>
            <Text style={styles.ctaText}>{ad.cta}</Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </View>
        </View>
      </AnimatedPressable>

      <AdLandingSheet visible={sheetOpen} ad={ad} onClose={() => setSheetOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  sponsoredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sponsored: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  image: {
    width: '100%',
    height: 140,
    marginTop: spacing.xs,
  },
  body: {
    padding: spacing.md,
  },
  brand: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  tagline: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  testimonialRow: {
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
