import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import {
  getDisguisedProfileHintLabel,
  getDisguisedSourceLabel,
  getPulseCategoryLabel,
  localizeTimeAgoLabel,
} from '../../i18n/labels';
import { DisguisedProfilePost, NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { ContentTypeIcon, MediaWithContentBadge } from './ContentTypeIcon';
import { FeedPersonThumbnail } from './FeedPersonThumbnail';
import { PROFILE_AVATAR_SIZE } from './DisguiseOverlayAvatar';
import { NewsHeroImage } from './NewsHeroImage';
import { AdLandingSheet } from './AdLandingSheet';
import { NewsArticleSheet } from './NewsArticleSheet';
import { PersonPreviewSheet } from './PersonPreviewSheet';
import { SocialCommentSheet } from './SocialCommentSheet';
import { disguisedProfileToAdPost, disguisedProfileToNewsPost } from '../../utils/disguisePulseDestinations';
import { profileIntroCaption } from '../../utils/profileIntroCaption';
import { profileIdFromPostId, resolveExplicitDatingProfile } from '../../utils/resolveDisguiseProfile';
import { usePulseContextSection } from '../../hooks/usePulseContextSection';
import { PulseProfileSwap } from '../motion/PulseProfileSwap';
import { AnimatedPressable } from '../AnimatedPressable';

type DisguisedProfileCardProps = {
  post: DisguisedProfilePost;
};

function OwnerHint({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.hintRow}>
      <Ionicons name="eye-outline" size={11} color={color} />
      <Text style={[styles.hintText, { color }]}>{label}</Text>
    </View>
  );
}

export function DisguisedProfileCard({ post }: DisguisedProfileCardProps) {
  const { colors } = useTheme();
  const { locale, t } = useTranslation();
  const { pulseSocial, togglePulseLike, preferences } = useApp();
  const pulseSection = usePulseContextSection();
  const meta = useDisguiseWorld();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [articleOpen, setArticleOpen] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const upvoted = pulseSocial.likedPostIds.includes(post.id);

  const linkedProfileId = post.profileId ?? profileIdFromPostId(post.id);
  const linkedProfile = resolveExplicitDatingProfile(linkedProfileId, pulseSection);
  const profileCaption = linkedProfile ? profileIntroCaption(linkedProfile) : post.overlayText;

  const reporter: NewsReporter = {
    id: post.id,
    name: post.name,
    avatarUrl: post.avatarUrl,
    quote: profileCaption,
    photos: post.photos,
    profileId: linkedProfile?.id,
  };

  const maskVariant = post.variant === 'ad' ? 'ad' : 'news';
  const maskSnippet = post.overlayText.split(' ').slice(0, 2).join(' ');

  const openPreview = () => {
    if (!linkedProfile) {
      return;
    }
    setPreviewOpen(true);
  };

  const articlePost = disguisedProfileToNewsPost(post, locale);
  const adPost = disguisedProfileToAdPost(post, t('disguiseAd.learnMore'));

  const previewSheet = (
    <PersonPreviewSheet
      visible={previewOpen}
      reporter={reporter}
      onClose={() => setPreviewOpen(false)}
    />
  );

  const avatarRow = (
    <PulseProfileSwap profileKey={linkedProfileId ?? post.id}>
      <FeedPersonThumbnail
        imageUrl={post.avatarUrl}
        overlayText={maskSnippet}
        overlayVariant={maskVariant}
        contentKind="profile"
        caption={profileCaption}
        hideLabel
        size={PROFILE_AVATAR_SIZE}
        onPress={openPreview}
        accessibilityLabel={t('disguiseMiniWindow.viewProfile', { name: post.name })}
      />
    </PulseProfileSwap>
  );

  if (post.variant === 'social') {
    return (
      <>
        <View style={[styles.socialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <PulseProfileSwap profileKey={linkedProfileId ?? post.id}>
            <FeedPersonThumbnail
              imageUrl={post.avatarUrl}
              overlayText={maskSnippet}
              overlayVariant={maskVariant}
              contentKind="profile"
              caption={linkedProfile ? linkedProfile.bio.trim() : post.summary}
              hideLabel
              size={PROFILE_AVATAR_SIZE}
              onPress={openPreview}
              accessibilityLabel={t('disguiseMiniWindow.viewProfile', { name: post.name })}
            />
          </PulseProfileSwap>
          <View style={styles.socialActions}>
            <AnimatedPressable style={styles.socialAction} onPress={() => togglePulseLike(post.id)}>
              <Ionicons
                name={upvoted ? 'arrow-up' : 'arrow-up-outline'}
                size={18}
                color={upvoted ? meta.accent : colors.textMuted}
              />
              <Text style={[styles.socialActionText, { color: upvoted ? meta.accent : colors.textMuted }]}>
                {upvoted ? 25 : 24}
              </Text>
            </AnimatedPressable>
            <AnimatedPressable style={styles.socialAction} onPress={() => setCommentsOpen(true)}>
              <Ionicons name="chatbubble-outline" size={18} color={meta.accent} />
              <Text style={[styles.socialActionText, { color: colors.textMuted }]}>3</Text>
            </AnimatedPressable>
          </View>
          <OwnerHint label={getDisguisedProfileHintLabel(locale, post.hintLabel)} color={meta.accent} />
        </View>
        {previewSheet}
        <SocialCommentSheet
          visible={commentsOpen}
          post={{
            id: post.id,
            type: 'social',
            author: post.name,
            handle: post.handle ?? `@${post.name.toLowerCase().replace(/\s+/g, '')}`,
            body: post.summary,
            avatarUrl: post.avatarUrl,
            timeAgo: post.timeAgo,
            likes: 24,
            comments: 3,
            avatarMask: { text: post.overlayText, variant: 'news' },
          }}
          onClose={() => setCommentsOpen(false)}
        />
      </>
    );
  }

  if (post.variant === 'ad') {
    return (
      <>
        <View style={[styles.card, { backgroundColor: '#1a1a2e', borderColor: colors.border }]}>
          <AnimatedPressable
            onPress={() => setAdOpen(true)}
            accessibilityRole="button"
            accessibilityLabel={t('disguisedProfile.disguisedAsAdA11y', { headline: post.headline })}
          >
            <View style={styles.sponsoredRow}>
              <Text style={styles.sponsored}>{t('disguiseAd.sponsored')}</Text>
              <ContentTypeIcon kind="sponsored" />
            </View>
            <NewsHeroImage uri={post.coverImageUrl} style={styles.adImage} accessibilityLabel={post.headline} />
            <View style={styles.body}>
              <Text style={styles.brand}>{post.headline}</Text>
              <Text style={styles.tagline}>{post.summary}</Text>
              <Text style={styles.spotlightHint} numberOfLines={2}>
                {t('disguisedProfile.spotlightHint')}
              </Text>
              <View style={[styles.cta, { backgroundColor: meta.accent }]}>
                <Text style={styles.ctaText}>{post.cta ?? t('disguiseAd.learnMore')}</Text>
                <Ionicons name="chevron-forward" size={14} color="#fff" />
              </View>
            </View>
          </AnimatedPressable>
          <View style={[styles.body, styles.adAvatarSection]}>
            {avatarRow}
            <OwnerHint label={getDisguisedProfileHintLabel(locale, post.hintLabel)} color={meta.accent} />
          </View>
        </View>
        <AdLandingSheet visible={adOpen} ad={adPost} onClose={() => setAdOpen(false)} />
        {previewSheet}
      </>
    );
  }

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AnimatedPressable
          onPress={() => setArticleOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={t('newsArticle.readArticleA11y', { headline: post.headline })}
        >
          <MediaWithContentBadge kind="news">
            <NewsHeroImage uri={post.coverImageUrl} style={styles.newsImage} accessibilityLabel={post.headline} />
          </MediaWithContentBadge>
          <View style={styles.body}>
            <View style={styles.metaRow}>
              <Text style={[styles.source, { color: meta.accent }]}>
                {getDisguisedSourceLabel(locale, post.sourceLabel)}
              </Text>
              <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
              {post.category ? (
                <Text style={[styles.category, { color: meta.accent }]}>
                  {getPulseCategoryLabel(locale, post.category)}
                </Text>
              ) : null}
              <Text style={[styles.time, { color: colors.textMuted }]}>
                {localizeTimeAgoLabel(locale, post.timeAgo)}
              </Text>
            </View>
            <Text style={[styles.headline, { color: colors.text }]}>{post.headline}</Text>
            <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={3}>
              {post.summary}
            </Text>
          </View>
        </AnimatedPressable>
        <View style={[styles.body, styles.reportersRow]}>{avatarRow}</View>
        <View style={[styles.body, styles.hintSection]}>
          <OwnerHint label={getDisguisedProfileHintLabel(locale, post.hintLabel)} color={meta.accent} />
        </View>
      </View>
      <NewsArticleSheet visible={articleOpen} post={articlePost} onClose={() => setArticleOpen(false)} />
      {previewSheet}
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
  socialCard: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sponsoredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  sponsored: {
    color: '#888',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  newsImage: {
    width: '100%',
    height: 180,
  },
  adImage: {
    width: '100%',
    height: 140,
    marginTop: spacing.xs,
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
  brand: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  tagline: {
    color: '#aaa',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  quoteAd: {
    color: '#ddd',
  },
  spotlightHint: {
    color: '#999',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    borderRadius: radii.button,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  ctaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  reportersRow: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
  },
  adAvatarSection: {
    paddingTop: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  hintSection: {
    paddingTop: 0,
  },
  socialBody: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  socialActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  socialAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  socialActionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.sm,
    opacity: 0.85,
  },
  hintText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
