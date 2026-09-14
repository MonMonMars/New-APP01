import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { SocialPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';

type SocialPostCardProps = {
  post: SocialPost;
};

export function SocialPostCard({ post }: SocialPostCardProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={[styles.author, { color: colors.text }]}>{post.author}</Text>
          <Text style={[styles.handle, { color: colors.textMuted }]}>
            {post.handle} · {post.timeAgo}
          </Text>
        </View>
        <Pressable>
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={[styles.body, { color: colors.text }]}>{post.body}</Text>
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.postImage} resizeMode="cover" />
      )}
      <View style={styles.actions}>
        <Pressable style={styles.action}>
          <Ionicons name="heart-outline" size={18} color={colors.textMuted} />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{post.likes}</Text>
        </Pressable>
        <Pressable style={styles.action}>
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{post.comments}</Text>
        </Pressable>
        <Pressable style={styles.action}>
          <Ionicons name="share-outline" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerText: {
    flex: 1,
  },
  author: {
    fontSize: 15,
    fontWeight: '700',
  },
  handle: {
    fontSize: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: radii.card,
    marginBottom: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.xs,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
