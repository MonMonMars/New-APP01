import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { SocialPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { showDemoToast } from '../../utils/demoFeedback';
import { DisguiseOverlayAvatar } from './DisguiseOverlayAvatar';
import { DisguiseOverlayImage } from './DisguiseOverlayImage';
import { AnimatedPressable } from '../AnimatedPressable';

type SocialPostCardProps = {
  post: SocialPost;
};

export function SocialPostCard({ post }: SocialPostCardProps) {
  const { colors } = useTheme();
  const [upvoted, setUpvoted] = useState(false);
  const likeCount = upvoted ? post.likes + 1 : post.likes;

  const bump = () => {
    if (Platform.OS !== 'web') {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        {post.maskAvatar !== false && post.avatarMask ? (
          <DisguiseOverlayAvatar
            imageUrl={post.avatarUrl}
            overlayText={post.avatarMask.text}
            variant={post.avatarMask.variant}
            size={40}
          />
        ) : (
          <Image source={{ uri: post.avatarUrl }} style={styles.avatar} />
        )}
        <View style={styles.headerText}>
          <Text style={[styles.author, { color: colors.text }]}>{post.author}</Text>
          <Text style={[styles.handle, { color: colors.textMuted }]}>
            {post.handle} · {post.timeAgo}
          </Text>
        </View>
        <AnimatedPressable
          onPress={() => {
            bump();
            showDemoToast('Post options', 'Mute, report, or save post.');
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </AnimatedPressable>
      </View>
      <Text style={[styles.body, { color: colors.text }]}>{post.body}</Text>
      {post.imageUrl && post.imageMask ? (
        <View style={styles.postImageWrap}>
          <DisguiseOverlayImage
            imageUrl={post.imageUrl}
            overlayText={post.imageMask.text}
            variant={post.imageMask.variant}
          />
        </View>
      ) : null}
      <View style={styles.actions}>
        <AnimatedPressable
          style={styles.action}
          onPress={() => {
            bump();
            setUpvoted((value) => !value);
          }}
        >
          <Ionicons
            name={upvoted ? 'arrow-up' : 'arrow-up-outline'}
            size={18}
            color={upvoted ? colors.gradientEnd : colors.textMuted}
          />
          <Text style={[styles.actionText, { color: upvoted ? colors.gradientEnd : colors.textMuted }]}>
            {likeCount}
          </Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={styles.action}
          onPress={() => {
            bump();
            showDemoToast('Comments', `${post.comments} replies on this post.`);
          }}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{post.comments}</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={styles.action}
          onPress={() => {
            bump();
            showDemoToast('Shared', 'Link copied to clipboard in this demo.');
          }}
        >
          <Ionicons name="share-outline" size={18} color={colors.textMuted} />
        </AnimatedPressable>
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
  postImageWrap: {
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
