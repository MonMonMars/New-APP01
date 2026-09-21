import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import { getPulseCategoryLabel, localizeTimeAgoLabel } from '../../i18n/labels';
import { NewsPost, NewsReporter } from '../../data/disguiseFeed';
import { radii, spacing } from '../../theme';
import { profileIntroCaption } from '../../utils/profileIntroCaption';
import { useDisguiseWorld } from '../../hooks/useDisguiseWorld';
import { usePulseContextSection } from '../../hooks/usePulseContextSection';
import {
  explicitReporterProfileId,
  resolveExplicitDatingProfile,
} from '../../utils/resolveDisguiseProfile';
import { MediaWithContentBadge } from './ContentTypeIcon';
import { FeedPersonThumbnail } from './FeedPersonThumbnail';
import { NewsArticleSheet } from './NewsArticleSheet';
import { NewsHeroImage } from './NewsHeroImage';
import { PersonPreviewSheet } from './PersonPreviewSheet';
import { PulseProfileSwap } from '../motion/PulseProfileSwap';
import { AnimatedPressable } from '../AnimatedPressable';

type NewsPostCardProps = {
  post: NewsPost;
};

export function NewsPostCard({ post }: NewsPostCardProps) {
  const { colors } = useTheme();
  const { locale, t } = useTranslation();
  const pulseSection = usePulseContextSection();
  const accent = useDisguiseWorld().accent;
  const [articleOpen, setArticleOpen] = useState(false);
  const [selectedReporter, setSelectedReporter] = useState<NewsReporter | null>(null);

  const linkedReporterProfile = (reporter: NewsReporter) =>
    resolveExplicitDatingProfile(explicitReporterProfileId(reporter.id, reporter.profileId), pulseSection);

  const openReporter = (reporter: NewsReporter) => {
    const linked = linkedReporterProfile(reporter);
    if (!linked) {
      return;
    }
    setSelectedReporter({ ...reporter, profileId: linked.id });
  };

  const closeReporter = () => {
    setSelectedReporter(null);
  };

  const reporterCaption = (reporter: NewsReporter): string => {
    const linked = linkedReporterProfile(reporter);
    if (linked) {
      return profileIntroCaption(linked);
    }
    return reporter.quote;
  };

  return (
    <>
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AnimatedPressable
          accessibilityRole="button"
          accessibilityLabel={t('newsArticle.readArticleA11y', { headline: post.headline })}
          onPress={() => setArticleOpen(true)}
        >
          <MediaWithContentBadge kind="news">
            <NewsHeroImage uri={post.imageUrl} style={styles.image} accessibilityLabel={post.headline} />
          </MediaWithContentBadge>
        </AnimatedPressable>
        <View style={styles.body}>
          <AnimatedPressable
            accessibilityRole="button"
            accessibilityLabel={t('newsArticle.readArticleA11y', { headline: post.headline })}
            onPress={() => setArticleOpen(true)}
          >
            <View style={styles.metaRow}>
              <Text style={[styles.source, { color: accent }]}>{post.source}</Text>
              <Text style={[styles.dot, { color: colors.textMuted }]}>·</Text>
              <Text style={[styles.category, { color: colors.textMuted }]}>
                {getPulseCategoryLabel(locale, post.category)}
              </Text>
              <Text style={[styles.time, { color: colors.textMuted }]}>
                {localizeTimeAgoLabel(locale, post.timeAgo)}
              </Text>
            </View>
            <Text style={[styles.headline, { color: colors.text }]}>{post.headline}</Text>
            <Text style={[styles.summary, { color: colors.textMuted }]} numberOfLines={3}>
              {post.summary}
            </Text>
          </AnimatedPressable>

          {post.reporters.length > 0 && (
            <View style={styles.reportersRow} accessibilityRole="list">
              {post.reporters.map((reporter) => {
                const linkedProfile = linkedReporterProfile(reporter);
                const reporterKind = linkedProfile ? 'profile' : 'news';
                return (
                  <PulseProfileSwap
                    key={reporter.id}
                    profileKey={linkedProfile?.id ?? reporter.id}
                    style={styles.reporterRow}
                  >
                    <FeedPersonThumbnail
                      plainAvatar
                      contentKind={reporterKind}
                      hideLabel
                      imageUrl={reporter.avatarUrl}
                      caption={reporterCaption(reporter)}
                      onPress={linkedProfile ? () => openReporter(reporter) : undefined}
                      accessibilityLabel={
                        linkedProfile
                          ? t('disguiseMiniWindow.viewPhotosFrom', { name: reporter.name })
                          : reporter.name
                      }
                    />
                  </PulseProfileSwap>
                );
              })}
            </View>
          )}
        </View>
      </View>

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
    gap: spacing.sm,
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
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  dot: {
    fontSize: 12,
  },
  category: {
    fontSize: 12,
  },
  time: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  headline: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  summary: {
    fontSize: 14,
    lineHeight: 20,
  },
  reportersRow: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  reporterRow: {
    width: '100%',
  },
});
