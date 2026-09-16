import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { AdPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { ContentTypeIcon, MediaWithContentBadge } from './ContentTypeIcon';
import { FeedPersonRow } from './FeedPersonRow';
import { AdLandingSheet } from './AdLandingSheet';
import { AnimatedPressable } from '../AnimatedPressable';

const AD_TESTIMONIALS = [
  {
    name: 'Jamie R.',
    quote: 'Switched last month — commute podcasts finally download offline.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
  },
  {
    name: 'Sofia L.',
    quote: 'The VPN deal paid for itself on one hotel Wi‑Fi trip.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
  },
  {
    name: 'Dev P.',
    quote: 'Flexible cancellation saved our weekend booking.',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
  },
];

type AdBannerCardProps = {
  ad: AdPost;
};

export function AdBannerCard({ ad }: AdBannerCardProps) {
  const { colors } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);
  const testimonial = AD_TESTIMONIALS[ad.id.length % AD_TESTIMONIALS.length];

  return (
    <>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={`Sponsored: ${ad.brand}`}
        onPress={() => setSheetOpen(true)}
        style={[styles.card, { backgroundColor: '#1a1a2e', borderColor: colors.border }]}
      >
        <View style={styles.sponsoredRow}>
          <Text style={styles.sponsored}>Sponsored</Text>
          <ContentTypeIcon kind="sponsored" />
        </View>
        <MediaWithContentBadge kind="ad">
          <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" />
        </MediaWithContentBadge>
        <View style={styles.body}>
          <Text style={styles.brand}>{ad.brand}</Text>
          <Text style={styles.tagline}>{ad.tagline}</Text>
          <FeedPersonRow
            plainAvatar
            contentKind="profile"
            imageUrl={testimonial.avatarUrl}
            title={testimonial.name}
            subtitle="Verified reader"
            body={`"${testimonial.quote}"`}
            bodyStyle={styles.testimonialQuote}
            style={styles.testimonialRow}
          />
          <View style={styles.cta}>
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
  testimonialQuote: {
    color: '#ccc',
    fontStyle: 'italic',
    fontWeight: '500',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#3b82f6',
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
