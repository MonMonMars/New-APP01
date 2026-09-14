import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { DisguisedProfilePost, NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { DisguiseOverlayAvatar } from './DisguiseOverlayAvatar';
import { PersonPreviewSheet } from './PersonPreviewSheet';

type DisguisedProfileCardProps = {
  post: DisguisedProfilePost;
};

export function DisguisedProfileCard({ post }: DisguisedProfileCardProps) {
  const { colors } = useTheme();
  const [previewOpen, setPreviewOpen] = useState(false);

  const reporter: NewsReporter = {
    id: post.id,
    name: post.name,
    avatarUrl: post.avatarUrl,
    quote: post.headline,
    photos: post.photos,
  };

  const isAd = post.variant === 'ad';

  return (
    <>
      <Pressable
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => setPreviewOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${post.name}: ${post.headline}`}
      >
        <View style={styles.metaRow}>
          <Text style={[styles.source, { color: isAd ? '#86efac' : colors.gradientEnd }]}>
            {post.sourceLabel}
          </Text>
          <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
          <Text style={[styles.category, { color: colors.textMuted }]}>
            {isAd ? 'Sponsored' : 'Community'}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>{post.timeAgo}</Text>
        </View>

        <View style={styles.contentRow}>
          <DisguiseOverlayAvatar
            imageUrl={post.avatarUrl}
            overlayText={post.overlayText}
            variant={post.variant}
            size={44}
          />
          <View style={styles.textCol}>
            <Text style={[styles.name, { color: colors.text }]}>{post.name}</Text>
            <Text style={[styles.headline, { color: colors.text }]} numberOfLines={2}>
              {post.headline}
            </Text>
            <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={2}>
              {post.summary}
            </Text>
          </View>
        </View>
      </Pressable>

      <PersonPreviewSheet
        visible={previewOpen}
        reporter={reporter}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  source: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dot: {
    fontSize: 11,
  },
  category: {
    fontSize: 11,
    fontWeight: '600',
  },
  time: {
    fontSize: 11,
    marginLeft: 'auto',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  textCol: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
  },
  headline: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  summary: {
    fontSize: 13,
    lineHeight: 18,
  },
});
