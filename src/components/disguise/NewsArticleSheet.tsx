import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { NewsPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { openExternalUrl } from '../../utils/openExternalUrl';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { AnimatedOverlay } from '../motion/AnimatedOverlay';
import { FadeSlideIn } from '../motion/FadeSlideIn';
import { SavePostButton } from './SavePostButton';
import { NewsHeroImage } from './NewsHeroImage';
import { AnimatedPressable } from '../AnimatedPressable';

type NewsArticleSheetProps = {
  visible: boolean;
  post: NewsPost | null;
  onClose: () => void;
};

export function NewsArticleSheet({ visible, post, onClose }: NewsArticleSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { recordPulseReading, preferences } = useApp();
  const meta = useDisguiseWorld();

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
            <View style={styles.toolbarMeta}>
              <Text style={[styles.source, { color: meta.accent }]}>{post.source}</Text>
              <Text style={[styles.category, { color: colors.textMuted }]}>{post.category}</Text>
            </View>
            <View style={styles.toolbarActions}>
              <SavePostButton postId={post.id} />
              <AnimatedPressable onPress={onClose} hitSlop={12} accessibilityLabel="Close" scaleTo={0.9}>
                <Ionicons name="close" size={24} color={colors.text} />
              </AnimatedPressable>
            </View>
          </View>
        </FadeSlideIn>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.content}
        >
          <FadeSlideIn replayKey={visible} index={1}>
            <NewsHeroImage uri={post.imageUrl} style={styles.hero} accessibilityLabel={post.headline} />
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
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <AnimatedPressable
            style={[styles.readOriginal, { backgroundColor: meta.accent }]}
            onPress={() => {
              void openExternalUrl(post.articleUrl, post.source);
            }}
            scaleTo={0.97}
            accessibilityLabel={`Read on ${post.source}`}
          >
            <Text style={styles.readOriginalText}>Read on {post.source}</Text>
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
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  hero: {
    width: '100%',
    height: 180,
    borderRadius: radii.card,
    marginBottom: spacing.md,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: spacing.xs,
  },
  time: {
    fontSize: 12,
    marginBottom: spacing.md,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
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
