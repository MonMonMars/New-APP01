import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { AdPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { ContentTypeIcon } from './ContentTypeIcon';
import { AdLandingSheet } from './AdLandingSheet';
import { AnimatedPressable } from '../AnimatedPressable';

type AdBannerCardProps = {
  ad: AdPost;
};

export function AdBannerCard({ ad }: AdBannerCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const meta = useDisguiseWorld();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={t('adBanner.sponsoredA11y', { brand: ad.brand })}
        onPress={() => setSheetOpen(true)}
        style={[styles.card, { backgroundColor: '#1a1a2e', borderColor: colors.border }]}
      >
        <View style={styles.sponsoredRow}>
          <Text style={styles.sponsored}>{t('disguiseAd.sponsored')}</Text>
          <ContentTypeIcon kind="sponsored" />
        </View>
        <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.body}>
          <Text style={styles.brand}>{ad.brand}</Text>
          <Text style={styles.tagline}>{ad.tagline}</Text>
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
