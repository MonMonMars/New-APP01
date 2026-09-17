import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { AdPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { openExternalUrl } from '../../utils/openExternalUrl';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';
import { FadeSlideIn } from '../motion/FadeSlideIn';
import { AnimatedPressable } from '../AnimatedPressable';

type AdLandingSheetProps = {
  visible: boolean;
  ad: AdPost | null;
  onClose: () => void;
};

export function AdLandingSheet({ visible, ad, onClose }: AdLandingSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { preferences } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection);

  if (!ad) {
    return null;
  }

  const paragraphs = ad.description?.split('\n\n').filter(Boolean) ?? [ad.tagline];

  const handleVisit = () => {
    void openExternalUrl(ad.landingUrl, ad.brand);
  };

  return (
    <AnimatedOverlay visible={visible} onClose={onClose} variant="bottom">
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <FadeSlideIn replayKey={visible} index={0}>
          <View style={[styles.toolbar, { borderBottomColor: colors.border }]}>
            <Text style={styles.sponsored}>Sponsored</Text>
            <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel="Close" scaleTo={0.9}>
              <Ionicons name="close" size={24} color={colors.text} />
            </AnimatedPressable>
          </View>
        </FadeSlideIn>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <FadeSlideIn replayKey={visible} index={1}>
            <Image source={{ uri: ad.imageUrl }} style={styles.hero} resizeMode="cover" />
          </FadeSlideIn>
          <FadeSlideIn replayKey={visible} index={2}>
            <Text style={[styles.brand, { color: colors.text }]}>{ad.brand}</Text>
            <Text style={[styles.tagline, { color: colors.textMuted }]}>{ad.tagline}</Text>
          </FadeSlideIn>
          {paragraphs.map((paragraph, index) => (
            <FadeSlideIn key={`${ad.id}-ad-p-${index}`} replayKey={visible} index={3 + index}>
              <Text style={[styles.paragraph, { color: colors.text }]}>{paragraph}</Text>
            </FadeSlideIn>
          ))}
        </ScrollView>
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <AnimatedPressable
            style={[styles.cta, { backgroundColor: meta.accent }]}
            onPress={handleVisit}
            scaleTo={0.97}
            accessibilityLabel={ad.cta}
          >
            <Text style={styles.ctaText}>{ad.cta}</Text>
            <Ionicons name="open-outline" size={16} color="#fff" />
          </AnimatedPressable>
        </View>
      </View>
    </AnimatedOverlay>
  );
}

const styles = StyleSheet.create({
  sheet: {
    maxHeight: '78%',
    borderTopLeftRadius: radii.card + 4,
    borderTopRightRadius: radii.card + 4,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  scroll: {
    maxHeight: 440,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sponsored: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#888',
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    width: '100%',
    height: 160,
    borderRadius: radii.card,
    marginBottom: spacing.md,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
