import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { AdPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { AdLandingSheet } from './AdLandingSheet';

type AdBannerCardProps = {
  ad: AdPost;
};

export function AdBannerCard({ ad }: AdBannerCardProps) {
  const { colors } = useTheme();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Sponsored: ${ad.brand}`}
        onPress={() => setSheetOpen(true)}
        style={[styles.card, { backgroundColor: '#1a1a2e', borderColor: colors.border }]}
      >
        <View style={styles.sponsoredRow}>
          <Text style={styles.sponsored}>Sponsored</Text>
          <Ionicons name="information-circle-outline" size={14} color="#888" />
        </View>
        <Image source={{ uri: ad.imageUrl }} style={styles.image} resizeMode="cover" />
        <View style={styles.body}>
          <Text style={styles.brand}>{ad.brand}</Text>
          <Text style={styles.tagline}>{ad.tagline}</Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{ad.cta}</Text>
            <Ionicons name="chevron-forward" size={14} color="#fff" />
          </View>
        </View>
      </Pressable>

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
    marginBottom: spacing.md,
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
