import { Ionicons } from '@expo/vector-icons';
import { Image, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../../context/ThemeContext';
import { AdPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { openExternalUrl } from '../../utils/openExternalUrl';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';
import { FadeSlideIn } from '../motion/FadeSlideIn';
import { AnimatedPressable } from '../AnimatedPressable';
import {
  disguiseReadHeroHeight,
  disguiseReadSheetHeight,
  disguiseReadSheetStyles,
} from './disguiseReadSheetLayout';

type AdLandingSheetProps = {
  visible: boolean;
  ad: AdPost | null;
  onClose: () => void;
};

export function AdLandingSheet({ visible, ad, onClose }: AdLandingSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { colors } = useTheme();
  const meta = useDisguiseWorld();
  const heroHeight = disguiseReadHeroHeight(windowHeight);
  const sheetHeight = disguiseReadSheetHeight(windowHeight);

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
          disguiseReadSheetStyles.sheet,
          {
            backgroundColor: colors.background,
            borderColor: colors.border,
            height: sheetHeight,
            maxHeight: sheetHeight,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <FadeSlideIn replayKey={visible} index={0}>
          <View style={[disguiseReadSheetStyles.toolbar, { borderBottomColor: colors.border }]}>
            <Text style={styles.sponsored}>Sponsored</Text>
            <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel="Close" scaleTo={0.9}>
              <Ionicons name="close" size={24} color={colors.text} />
            </AnimatedPressable>
          </View>
        </FadeSlideIn>

        <ScrollView
          style={disguiseReadSheetStyles.scroll}
          contentContainerStyle={disguiseReadSheetStyles.content}
          showsVerticalScrollIndicator={false}
        >
          <FadeSlideIn replayKey={visible} index={1}>
            <Image
              source={{ uri: ad.imageUrl }}
              style={[styles.hero, { height: heroHeight }]}
              resizeMode="cover"
            />
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
        <View style={[disguiseReadSheetStyles.footer, { borderTopColor: colors.border }]}>
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
  sponsored: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#888',
  },
  hero: {
    width: '100%',
    borderRadius: radii.card,
    marginBottom: spacing.md,
  },
  brand: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: spacing.md,
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
