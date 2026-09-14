import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { DisguisedProfilePost, NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { DisguiseOverlayAvatar } from './DisguiseOverlayAvatar';
import { PersonPreviewSheet } from './PersonPreviewSheet';

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
  const [previewOpen, setPreviewOpen] = useState(false);

  const reporter: NewsReporter = {
    id: post.id,
    name: post.name,
    avatarUrl: post.avatarUrl,
    quote: post.overlayText,
    photos: post.photos,
  };

  const maskVariant = post.variant === 'ad' ? 'ad' : 'news';
  const maskSnippet = post.overlayText.split(' ').slice(0, 2).join(' ');

  const openPreview = () => setPreviewOpen(true);

  const previewSheet = (
    <PersonPreviewSheet
      visible={previewOpen}
      reporter={reporter}
      onClose={() => setPreviewOpen(false)}
    />
  );

  if (post.variant === 'social') {
    return (
      <>
        <View style={[styles.socialCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.socialHeader}>
            <Pressable
              onPress={openPreview}
              accessibilityRole="button"
              accessibilityLabel={`View profile photos from ${post.name}`}
            >
              <DisguiseOverlayAvatar
                imageUrl={post.avatarUrl}
                overlayText={maskSnippet}
                variant="news"
                size={40}
              />
            </Pressable>
            <View style={styles.socialHeaderText}>
              <Text style={[styles.socialAuthor, { color: colors.text }]}>{post.headline}</Text>
              <Text style={[styles.socialHandle, { color: colors.textMuted }]}>
                {post.handle} · {post.timeAgo}
              </Text>
            </View>
            <Pressable onPress={openPreview}>
              <Ionicons name="ellipsis-horizontal" size={18} color={colors.textMuted} />
            </Pressable>
          </View>
          <Pressable onPress={openPreview}>
            <Text style={[styles.socialBody, { color: colors.text }]}>{post.summary}</Text>
          </Pressable>
          <View style={styles.socialActions}>
            <View style={styles.socialAction}>
              <Ionicons name="arrow-up-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.socialActionText, { color: colors.textMuted }]}>24</Text>
            </View>
            <View style={styles.socialAction}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.textMuted} />
              <Text style={[styles.socialActionText, { color: colors.textMuted }]}>3</Text>
            </View>
          </View>
          <OwnerHint label={post.hintLabel} color={colors.gradientEnd} />
        </View>
        {previewSheet}
      </>
    );
  }

  if (post.variant === 'ad') {
    return (
      <>
        <Pressable
          style={[styles.card, { backgroundColor: '#1a1a2e', borderColor: colors.border }]}
          onPress={openPreview}
          accessibilityRole="button"
          accessibilityLabel={`Profile disguised as ad: ${post.headline}`}
        >
          <View style={styles.sponsoredRow}>
            <Text style={styles.sponsored}>Sponsored</Text>
            <Text style={[styles.profileTag, { color: colors.gradientEnd }]}>Profile</Text>
            <Ionicons name="information-circle-outline" size={14} color="#888" />
          </View>
          <Image source={{ uri: post.coverImageUrl }} style={styles.adImage} resizeMode="cover" />
          <View style={styles.body}>
            <Text style={styles.brand}>{post.headline}</Text>
            <Text style={styles.tagline}>{post.summary}</Text>
            <View style={styles.spotlightRow}>
              <Pressable
                onPress={(event) => {
                  event.stopPropagation();
                  openPreview();
                }}
                accessibilityRole="button"
                accessibilityLabel="View profile photo"
              >
                <DisguiseOverlayAvatar
                  imageUrl={post.avatarUrl}
                  overlayText="AD"
                  variant="ad"
                  size={40}
                />
              </Pressable>
              <Text style={styles.spotlightText} numberOfLines={2}>
                Reader spotlight — masked photo is a profile, not part of this ad.
              </Text>
            </View>
            <View style={styles.cta}>
              <Text style={styles.ctaText}>{post.cta ?? 'Learn more'}</Text>
              <Ionicons name="chevron-forward" size={14} color="#fff" />
            </View>
            <OwnerHint label={post.hintLabel} color={colors.gradientEnd} />
          </View>
        </Pressable>
        {previewSheet}
      </>
    );
  }

  return (
    <>
      <Pressable
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={openPreview}
        accessibilityRole="button"
        accessibilityLabel={`Profile disguised as news: ${post.headline}`}
      >
        <Image source={{ uri: post.coverImageUrl }} style={styles.newsImage} resizeMode="cover" />
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Text style={[styles.source, { color: colors.gradientEnd }]}>{post.sourceLabel}</Text>
            <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
            <Text style={[styles.category, { color: colors.gradientEnd }]}>{post.category}</Text>
            <Text style={[styles.profileTag, { color: colors.gradientEnd }]}>· Profile</Text>
            <Text style={[styles.time, { color: colors.textMuted }]}>{post.timeAgo}</Text>
          </View>
          <Text style={[styles.headline, { color: colors.text }]}>{post.headline}</Text>
          <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={3}>
            {post.summary}
          </Text>

          <View style={styles.reportersRow}>
            <Pressable
              style={styles.reporterCell}
              onPress={(event) => {
                event.stopPropagation();
                openPreview();
              }}
              accessibilityRole="button"
              accessibilityLabel="View profile — masked BREAKING avatar"
            >
              <DisguiseOverlayAvatar
                imageUrl={post.avatarUrl}
                overlayText={maskSnippet}
                variant="news"
                size={44}
              />
              <Text style={[styles.reporterQuote, { color: colors.text }]} numberOfLines={3}>
                {post.overlayText}
              </Text>
            </Pressable>
          </View>
          <OwnerHint label={post.hintLabel} color={colors.gradientEnd} />
        </View>
      </Pressable>
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
  profileTag: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
  spotlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  spotlightText: {
    flex: 1,
    color: '#999',
    fontSize: 11,
    lineHeight: 15,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: '#3b82f6',
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
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128,128,128,0.25)',
  },
  reporterCell: {
    flex: 1,
    alignItems: 'center',
    maxWidth: 120,
  },
  reporterQuote: {
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  socialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  socialHeaderText: {
    flex: 1,
  },
  socialAuthor: {
    fontSize: 15,
    fontWeight: '700',
  },
  socialHandle: {
    fontSize: 12,
  },
  socialBody: {
    fontSize: 15,
    lineHeight: 22,
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
