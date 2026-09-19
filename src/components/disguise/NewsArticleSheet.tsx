import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { getPulseCategoryLabel } from '../../i18n/labels';
import { NewsPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { openExternalUrl } from '../../utils/openExternalUrl';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';
import { FadeSlideIn } from '../motion/FadeSlideIn';
import { SavePostButton } from './SavePostButton';
import { NewsHeroImage } from './NewsHeroImage';
import { AnimatedPressable } from '../AnimatedPressable';
import {
  disguiseReadHeroHeight,
  disguiseReadSheetHeight,
  disguiseReadSheetStyles,
} from './disguiseReadSheetLayout';

type NewsArticleSheetProps = {
  visible: boolean;
  post: NewsPost | null;
  onClose: () => void;
};

export function NewsArticleSheet({ visible, post, onClose }: NewsArticleSheetProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { colors } = useTheme();
  const { locale, t } = useTranslation();
  const { recordPulseReading } = useApp();
  const meta = useDisguiseWorld();
  const heroHeight = disguiseReadHeroHeight(windowHeight);
  const sheetHeight = disguiseReadSheetHeight(windowHeight);

  useEffect(() => {
    if (visible && post) {
      recordPulseReading(post.headline, post.source);
    }
  }, [visible, post, recordPulseReading]);

  if (!post) {
    return null;
  }

  const paragraphs = post.articleBody.split('\n\n').filter(Boolean);

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
            <View style={styles.toolbarMeta}>
              <Text style={[styles.source, { color: meta.accent }]}>{post.source}</Text>
              <Text style={[styles.category, { color: colors.textMuted }]}>
                {getPulseCategoryLabel(locale, post.category)}
              </Text>
            </View>
            <View style={styles.toolbarActions}>
              <SavePostButton postId={post.id} />
              <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel={t('common.close')} scaleTo={0.9}>
                <Ionicons name="close" size={24} color={colors.text} />
              </AnimatedPressable>
            </View>
          </View>
        </FadeSlideIn>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={disguiseReadSheetStyles.scroll}
          contentContainerStyle={disguiseReadSheetStyles.content}
        >
          <FadeSlideIn replayKey={visible} index={1}>
            <NewsHeroImage
              uri={post.imageUrl}
              style={[styles.hero, { height: heroHeight }]}
              accessibilityLabel={post.headline}
            />
          </FadeSlideIn>
          <FadeSlideIn replayKey={visible} index={2}>
            <Text style={[styles.headline, { color: colors.text }]}>{post.headline}</Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>{post.timeAgo}</Text>
          </FadeSlideIn>
          {paragraphs.map((paragraph, index) => (
            <FadeSlideIn key={`${post.id}-p-${index}`} replayKey={visible} index={3 + index}>
              <Text style={[styles.paragraph, { color: colors.text }]}>{paragraph}</Text>
            </FadeSlideIn>
          ))}
        </ScrollView>
        <View style={[disguiseReadSheetStyles.footer, { borderTopColor: colors.border }]}>
          <AnimatedPressable
            style={[styles.readOriginal, { backgroundColor: meta.accent }]}
            onPress={() => {
              void openExternalUrl(post.articleUrl, post.source, locale);
            }}
            scaleTo={0.97}
            accessibilityLabel={t('newsArticle.readOnA11y', { source: post.source })}
          >
            <Text style={styles.readOriginalText}>{t('newsArticle.readOn', { source: post.source })}</Text>
            <Ionicons name="open-outline" size={16} color="#fff" />
          </AnimatedPressable>
        </View>
      </View>
    </AnimatedOverlay>
  );
}

const styles = StyleSheet.create({
  toolbarMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  toolbarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  source: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
  },
  hero: {
    width: '100%',
    borderRadius: radii.card,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: 12,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  readOriginal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radii.button,
    paddingVertical: spacing.md,
  },
  readOriginalText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
