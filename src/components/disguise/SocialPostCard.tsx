import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { getDisguiseOverlaySnippet, localizeTimeAgoLabel } from '../../i18n/labels';
import { SocialPost } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { buildSocialReporter, socialReporterPhotoIndex } from '../../utils/disguiseReporterPhotos';
import { resolveSocialPostProfileId } from '../../utils/disguiseReporterPhotos';
import { resolveExplicitDatingProfile } from '../../utils/resolveDisguiseProfile';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { usePulseContextSection } from '../../hooks/usePulseContextSection';
import { DisguiseOverlayImage } from './DisguiseOverlayImage';
import { DisguisePhotoLightbox } from './DisguisePhotoLightbox';
import { FeedPersonThumbnail } from './FeedPersonThumbnail';
import { PersonPreviewSheet } from './PersonPreviewSheet';
import { SocialCommentSheet } from './SocialCommentSheet';
import { SavePostButton } from './SavePostButton';
import { shareWithFallback } from '../../utils/shareWithFallback';
import { PulseProfileSwap } from '../motion/PulseProfileSwap';
import { AnimatedPressable } from '../AnimatedPressable';

type SocialPostCardProps = {
  post: SocialPost;
};

export function SocialPostCard({ post }: SocialPostCardProps) {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const {
    pulseSocial,
    savePulsePost,
    unsavePulsePost,
    togglePulseLike,
    mutePulseAuthor,
    reportPulsePost,
  } = useApp();
  const pulseSection = usePulseContextSection();
  const accent = useDisguiseWorld().accent;
  const upvoted = pulseSocial.likedPostIds.includes(post.id);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [authorOpen, setAuthorOpen] = useState(false);
  const isSaved = pulseSocial.savedPostIds.includes(post.id);
  const likeCount = upvoted ? post.likes + 1 : post.likes;

  const photoReporter = buildSocialReporter(post, pulseSection);
  const feedPhotoIndex = socialReporterPhotoIndex(photoReporter, post.imageUrl, pulseSection);
  const linkedAuthorProfile = resolveExplicitDatingProfile(
    resolveSocialPostProfileId(post),
    pulseSection,
  );
  const authorAvatarUrl = linkedAuthorProfile?.photos[0] ?? post.avatarUrl;
  const authorContentKind = linkedAuthorProfile ? 'profile' : 'social';
  const maskSnippet = post.avatarMask?.text.split(' ').slice(0, 2).join(' ')
    ? getDisguiseOverlaySnippet(locale, post.avatarMask.text.split(' ').slice(0, 2).join(' '))
    : t('profile.live');
  const handleSave = () => {
    if (isSaved) {
      unsavePulsePost(post.id);
      Alert.alert(t('pulseSocial.removedTitle'), t('pulseSocial.removedBody'));
      return;
    }
    savePulsePost(post.id);
    Alert.alert(t('pulseSocial.savedTitle'), t('pulseSocial.savedBody'));
  };

  const handleMute = () => {
    mutePulseAuthor(post.handle);
    Alert.alert(t('pulseSocial.mutedTitle'), t('pulseSocial.mutedBody', { author: post.author }));
  };

  const handleReport = () => {
    Alert.alert(t('pulseSocial.reportTitle'), t('pulseSocial.reportPrompt'), [
      { text: t('pulseSocial.cancel'), style: 'cancel' },
      {
        text: t('pulseSocial.reportMisleading'),
        onPress: () => {
          reportPulsePost(post.id, t('pulseSocial.reportMisleading'));
          Alert.alert(t('pulseSocial.reportedTitle'), t('pulseSocial.reportedBody'));
        },
      },
      {
        text: t('pulseSocial.reportHarmful'),
        style: 'destructive',
        onPress: () => {
          reportPulsePost(post.id, t('pulseSocial.reportHarmful'));
          Alert.alert(t('pulseSocial.reportedTitle'), t('pulseSocial.reportedBody'));
        },
      },
    ]);
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.headerMain}>
          <PulseProfileSwap profileKey={linkedAuthorProfile?.id ?? post.id} style={styles.avatarSwapWrap}>
            <FeedPersonThumbnail
              imageUrl={authorAvatarUrl}
              plainAvatar={
                Boolean(linkedAuthorProfile) || post.maskAvatar === false || !post.avatarMask
              }
              overlayText={
                linkedAuthorProfile || post.maskAvatar === false || !post.avatarMask
                  ? undefined
                  : maskSnippet
              }
              overlayVariant={post.avatarMask?.variant ?? 'news'}
              contentKind={authorContentKind}
              hideLabel
              showIconBadge={!linkedAuthorProfile && authorContentKind !== 'profile'}
              onPress={linkedAuthorProfile ? () => setAuthorOpen(true) : undefined}
              accessibilityLabel={
                linkedAuthorProfile
                  ? t('disguiseMiniWindow.viewProfile', { name: post.author })
                  : post.author
              }
            />
          </PulseProfileSwap>
          <View style={styles.authorMeta}>
            <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={1}>
              {post.author}
            </Text>
            <Text style={[styles.authorHandle, { color: colors.textMuted }]} numberOfLines={1}>
              {post.handle} · {localizeTimeAgoLabel(locale, post.timeAgo)}
            </Text>
          </View>
        </View>
        <SavePostButton postId={post.id} />
        <AnimatedPressable
          style={styles.moreButton}
          onPress={() => {
            Alert.alert(t('pulseSocial.postOptions'), undefined, [
              { text: isSaved ? t('pulseSocial.unsavePost') : t('pulseSocial.savePost'), onPress: handleSave },
              { text: t('pulseSocial.muteAuthor'), onPress: handleMute },
              { text: t('pulseSocial.report'), style: 'destructive', onPress: handleReport },
              { text: t('pulseSocial.cancel'), style: 'cancel' },
            ]);
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color={accent} />
        </AnimatedPressable>
      </View>
      <Text style={[styles.body, { color: colors.text }]}>{post.body}</Text>
      {post.imageUrl && post.imageMask ? (
        <AnimatedPressable
          style={styles.postImageWrap}
          onPress={() => setPhotoOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t('pulseSocial.openPostPhoto')}
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
          accessibilityRole="button"
          accessibilityLabel={
            upvoted ? t('pulseSocial.removeUpvoteA11y') : t('pulseSocial.upvotePostA11y')
          }
          onPress={() => togglePulseLike(post.id)}
        >
          <Ionicons
            name={upvoted ? 'arrow-up' : 'arrow-up-outline'}
            size={18}
            color={upvoted ? accent : colors.textMuted}
          />
          <Text style={[styles.actionText, { color: upvoted ? accent : colors.textMuted }]}>
            {likeCount}
          </Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={styles.action}
          onPress={() => setCommentsOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t('pulseSocial.openCommentsA11y', { count: post.comments })}
        >
          <Ionicons name="chatbubble-outline" size={18} color={accent} />
          <Text style={[styles.actionText, { color: colors.textMuted }]}>{post.comments}</Text>
        </AnimatedPressable>
        <AnimatedPressable
          style={styles.action}
          onPress={() => {
            void shareWithFallback({
              message: `${post.author}: ${post.body}`,
              title: t('pulseSocial.sharePost'),
              locale,
            });
          }}
        >
          <Ionicons name="share-outline" size={18} color={accent} />
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
  avatarSwapWrap: {
    flexShrink: 0,
  },
  authorMeta: {
    flex: 1,
    minWidth: 0,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: spacing.sm,
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
