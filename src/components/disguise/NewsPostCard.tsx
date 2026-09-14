import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { NewsPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { openExternalUrl } from '../../utils/openExternalUrl';

type NewsPostCardProps = {
  post: NewsPost;
};

export function NewsPostCard({ post }: NewsPostCardProps) {
  const { colors } = useTheme();

  const handlePress = () => {
    void openExternalUrl(post.articleUrl, post.headline);
  };

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`Read article: ${post.headline}`}
      onPress={handlePress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <Image source={{ uri: post.imageUrl }} style={styles.image} resizeMode="cover" />
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
      </View>
    </Pressable>
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
  },
});
