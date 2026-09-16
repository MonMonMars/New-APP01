import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { SocialPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { buildSocialReporter, socialReporterPhotoIndex } from '../../utils/disguiseReporterPhotos';
import { maskVariantToContentKind } from './ContentTypeIcon';
import { DisguiseOverlayImage } from './DisguiseOverlayImage';
import { DisguisePhotoLightbox } from './DisguisePhotoLightbox';
import { FeedPersonThumbnail } from './FeedPersonThumbnail';
import { PersonPreviewSheet } from './PersonPreviewSheet';
import { SocialCommentSheet } from './SocialCommentSheet';
import { SavePostButton } from './SavePostButton';
import { shareWithFallback } from '../../utils/shareWithFallback';
import { AnimatedPressable } from '../AnimatedPressable';

type SocialPostCardProps = {
  post: SocialPost;
};

export function SocialPostCard({ post }: SocialPostCardProps) {
  const { colors } = useTheme();
  const {
    pulseSocial,
    savePulsePost,
    unsavePulsePost,
    togglePulseLike,
    mutePulseAuthor,
    reportPulsePost,
  } = useApp();
  const upvoted = pulseSocial.likedPostIds.includes(post.id);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [authorOpen, setAuthorOpen] = useState(false);
  const isSaved = pulseSocial.savedPostIds.includes(post.id);
  const likeCount = upvoted ? post.likes + 1 : post.likes;

  const photoReporter = buildSocialReporter(post);
  const feedPhotoIndex = socialReporterPhotoIndex(photoReporter, post.imageUrl);

  const maskSnippet = post.avatarMask?.text.split(' ').slice(0, 2).join(' ') ?? 'LIVE';
  const avatarContentKind = post.avatarMask
    ? maskVariantToContentKind(post.avatarMask.variant)
    : 'social';
  const captionSnippet =
    post.body.length > 72 ? `${post.body.slice(0, 72).trim()}…` : post.body;

  const handleSave = () => {
    if (isSaved) {
      unsavePulsePost(post.id);
      Alert.alert('Removed', 'Post removed from saved.');
      return;
    }
    savePulsePost(post.id);
    Alert.alert('Saved', 'Post added to your saved list.');
  };

  const handleMute = () => {
    mutePulseAuthor(post.handle);
    Alert.alert('Muted', `${post.author} will no longer appear in your feed.`);
  };

  const handleReport = () => {
    Alert.alert('Report post', 'Why are you reporting this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Misleading',
        onPress: () => {
          reportPulsePost(post.id, 'Misleading content');
          Alert.alert('Reported', 'Thanks — we will review this post.');
        },
      },
      {
        text: 'Harmful',
        style: 'destructive',
        onPress: () => {
          reportPulsePost(post.id, 'Harmful content');
          Alert.alert('Reported', 'Thanks — we will review this post.');
        },
      },
    ]);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerMain}>
          {post.maskAvatar !== false && post.avatarMask ? (
            <FeedPersonThumbnail
              imageUrl={post.avatarUrl}
              overlayText={maskSnippet}
              overlayVariant={post.avatarMask.variant}
              contentKind={avatarContentKind}
              caption={captionSnippet}
              onPress={() => setAuthorOpen(true)}
              accessibilityLabel={`View profile: ${post.author}`}
            />
          ) : (
            <FeedPersonThumbnail
              plainAvatar
              contentKind="social"
              caption={captionSnippet}
              imageUrl={post.avatarUrl}
              onPress={() => setAuthorOpen(true)}
              accessibilityLabel={`View profile: ${post.author}`}
            />
          )}
          <View style={styles.authorMeta}>
            <Text style={[styles.authorName, { color: colors.text }]}>{post.author}</Text>
            <Text style={[styles.authorHandle, { color: colors.textMuted }]}>
              {post.handle} · {post.timeAgo}
            </Text>
          </View>
        </View>
        <SavePostButton postId={post.id} />
        <AnimatedPressable
          style={styles.moreButton}
          onPress={() => {
            Alert.alert('Post options', undefined, [
              { text: isSaved ? 'Unsave post' : 'Save post', onPress: handleSave },
              { text: 'Mute author', onPress: handleMute },
              { text: 'Report', style: 'destructive', onPress: handleReport },
              { text: 'Cancel', style: 'cancel' },
            ]);
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
        </AnimatedPressable>
      </View>
      <Text style={[styles.body, { color: colors.text }]}>{post.body}</Text>
      {post.imageUrl && post.imageMask ? (
        <AnimatedPressable
          style={styles.postImageWrap}
          onPress={() => setPhotoOpen(true)}
          accessibilityRole="button"
          accessibilityLabel="Open post photo"
        >
          <DisguiseOverlayImage
            imageUrl={post.imageUrl}
            overlayText={post.imageMask.text}
            variant={post.imageMask.variant}
          />
        </AnimatedPressable>
      ) : null}
      <View style={styles.actions}>
        <AnimatedPressable
          style={styles.action}
          onPress={() => togglePulseLike(post.id)}
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
          onPress={() => setCommentsOpen(true)}
        >
          <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{post.comments}</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={styles.action}
          onPress={() => {
            void shareWithFallback({
              message: `${post.author}: ${post.body}`,
              title: 'Share post',
            });
          }}
        >
          <Ionicons name="share-outline" size={18} color={colors.textMuted} />
        </AnimatedPressable>
      </View>

      <DisguisePhotoLightbox
        visible={photoOpen}
        reporter={photoReporter}
        photoUrl={post.imageUrl ?? post.avatarUrl}
        photoIndex={feedPhotoIndex}
        onClose={() => setPhotoOpen(false)}
      />
      <SocialCommentSheet visible={commentsOpen} post={post} onClose={() => setCommentsOpen(false)} />
      <PersonPreviewSheet
        visible={authorOpen}
        reporter={photoReporter}
        onClose={() => setAuthorOpen(false)}
      />
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 0,
  },
  authorMeta: {
    flex: 1,
    minWidth: 0,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  authorHandle: {
    fontSize: 12,
    marginTop: 1,
  },
  moreButton: {
    paddingTop: 4,
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
