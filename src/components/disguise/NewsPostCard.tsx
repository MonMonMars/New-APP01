import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { NewsPost, NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { MediaWithContentBadge } from './ContentTypeIcon';
import { FeedPersonThumbnail } from './FeedPersonThumbnail';
import { NewsArticleSheet } from './NewsArticleSheet';
import { PersonPreviewSheet } from './PersonPreviewSheet';
import { AnimatedPressable } from '../AnimatedPressable';

type NewsPostCardProps = {
  post: NewsPost;
};

export function NewsPostCard({ post }: NewsPostCardProps) {
  const { colors } = useTheme();
  const [articleOpen, setArticleOpen] = useState(false);
  const [selectedReporter, setSelectedReporter] = useState<NewsReporter | null>(null);

  const openReporter = (reporter: NewsReporter) => {
    setSelectedReporter(reporter);
  };

  const closeReporter = () => {
    setSelectedReporter(null);
  };

  return (
    <>
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={`Read article: ${post.headline}`}
        onPress={() => setArticleOpen(true)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <MediaWithContentBadge kind="news">
          <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
        </MediaWithContentBadge>
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Text style={[styles.source, { color: colors.gradientEnd }]}>{post.source}</Text>
            <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
            <Text style={[styles.category, { color: colors.textMuted }]}>{post.category}</Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>{post.timeAgo}</Text>
          </View>
          <Text style={[styles.headline, { color: colors.text }]}>{post.headline}</Text>
          <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={3}>
            {post.summary}
          </Text>

          {post.reporters.length > 0 && (
            <View style={styles.reportersRow}>
              {post.reporters.map((reporter) => (
                <FeedPersonThumbnail
                  key={reporter.id}
                  plainAvatar
                  contentKind="profile"
                  imageUrl={reporter.avatarUrl}
                  caption={reporter.quote}
                  onPress={() => openReporter(reporter)}
                  accessibilityLabel={`View photos from ${reporter.name}`}
                  style={styles.reporterRow}
                />
              ))}
            </View>
          )}
        </View>
      </AnimatedPressable>

      <NewsArticleSheet visible={articleOpen} post={post} onClose={() => setArticleOpen(false)} />
      <PersonPreviewSheet
        visible={selectedReporter !== null}
        reporter={selectedReporter}
        onClose={closeReporter}
      />
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
  image: {
    width: '100%',
    height: 180,
  },
  body: {
    padding: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.xs,
  },
  source: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dot: {
    fontSize: 12,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  headline: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  reportersRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
    gap: spacing.sm,
  },
  reporterRow: {
    width: '100%',
  },
});
