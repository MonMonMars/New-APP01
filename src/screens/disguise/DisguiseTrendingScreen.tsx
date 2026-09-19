import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MediaWithContentBadge } from '../../components/disguise/ContentTypeIcon';
import { DisguiseHeader } from '../../components/disguise/DisguiseHeader';
import { DisguiseMarketsPanel } from '../../components/disguise/DisguiseMarketsPanel';
import { DisguiseWeatherPanel } from '../../components/disguise/DisguiseWeatherPanel';
import { NewsArticleSheet } from '../../components/disguise/NewsArticleSheet';
import { NewsHeroImage } from '../../components/disguise/NewsHeroImage';
import { useApp } from '../../context/AppContext';
import { useAppLocale } from '../../hooks/useAppLocale';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from '../../i18n';
import {
  getPulseCategoryLabel,
  getTrendingChangeLabel,
  getTrendingChipLabel,
} from '../../i18n/labels';
import { NewsPost } from '../../data/disguiseFeed';
import {
  femaleBreakingNowCards,
  femaleCosmosRadarItems,
  femaleEditorsPicks,
  femalePulseBrief,
  femaleTrendingCategoryChips,
  femaleTrendingTopics,
} from '../../data/disguiseFemaleTrending';
import {
  breakingNowCards,
  disguiseTrendingTopics,
  editorsPicks,
  localRadarItems,
  pulseBrief,
  trendingCategoryChips,
  TrendDirection,
  TrendingCategoryChip,
} from '../../data/disguiseTrending';
import { useDisguiseWeather } from '../../hooks/useDisguiseWeather';
import { DisguiseTabParamList } from '../../navigation/DisguiseNavigator';
import { radii, spacing } from '../../theme';
import { navigateDisguiseFeedTopic } from '../../utils/disguiseNavigation';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { usesFemalePulseExperience } from '../../utils/genderAccountPerks';
import { briefToNewsPost, breakingToNewsPost, editorsPickToNewsPost } from '../../utils/disguiseTrendingArticles';
import { PulseFeedRefreshFooter } from '../../components/disguise/PulseFeedRefreshFooter';
import { AnimatedPressable } from '../../components/AnimatedPressable';
import { useRotatedPulseContent } from '../../hooks/useRotatedPulseContent';
import { usePulseScrollRefresh } from '../../hooks/usePulseFeedRefresh';

function trendIcon(direction: TrendDirection): keyof typeof Ionicons.glyphMap {
  switch (direction) {
    case 'up':
      return 'arrow-up';
    case 'down':
      return 'arrow-down';
    case 'new':
      return 'sparkles';
    case 'hot':
      return 'flame';
    case 'stable':
      return 'remove';
    default: {
      const _exhaustive: never = direction;
      return _exhaustive;
    }
  }
}

function trendColor(direction: TrendDirection, accent: string): string {
  switch (direction) {
    case 'up':
    case 'hot':
      return '#22c55e';
    case 'down':
      return '#ef4444';
    case 'new':
      return accent;
    case 'stable':
      return '#94a3b8';
    default: {
      const _exhaustive: never = direction;
      return _exhaustive;
    }
  }
}

function chipIcon(icon: TrendingCategoryChip['icon']): keyof typeof Ionicons.glyphMap {
  switch (icon) {
    case 'flash':
      return 'flash-outline';
    case 'business':
      return 'hardware-chip-outline';
    case 'location':
      return 'location-outline';
    case 'restaurant':
      return 'restaurant-outline';
    case 'trending-up':
      return 'trending-up-outline';
    case 'calendar':
      return 'calendar-outline';
    case 'cloud':
      return 'partly-sunny-outline';
    default: {
      const _exhaustive: never = icon;
      return _exhaustive;
    }
  }
}

function radarIcon(icon: 'train' | 'cloud' | 'ticket' | 'wifi'): keyof typeof Ionicons.glyphMap {
  switch (icon) {
    case 'train':
      return 'train-outline';
    case 'cloud':
      return 'partly-sunny-outline';
    case 'ticket':
      return 'ticket-outline';
    case 'wifi':
      return 'wifi-outline';
    default: {
      const _exhaustive: never = icon;
      return _exhaustive;
    }
  }
}

export function DisguiseTrendingScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<DisguiseTabParamList>>();
  const { user, preferences } = useApp();
  const { locale } = useAppLocale();
  const { t } = useTranslation();
  const meta = disguiseWorldMeta(preferences.sparkSection, user.gender, locale);
  const isFemalePulse = usesFemalePulseExperience(user.gender);
  const brief = isFemalePulse ? femalePulseBrief : pulseBrief;
  const categoryChips = useRotatedPulseContent(
    isFemalePulse ? femaleTrendingCategoryChips : trendingCategoryChips,
  );
  const breakingCards = useRotatedPulseContent(
    isFemalePulse ? femaleBreakingNowCards : breakingNowCards,
  );
  const radarItems = useRotatedPulseContent(isFemalePulse ? femaleCosmosRadarItems : localRadarItems);
  const trendingTopics = useRotatedPulseContent(
    isFemalePulse ? femaleTrendingTopics : disguiseTrendingTopics,
  );
  const editorPicks = useRotatedPulseContent(isFemalePulse ? femaleEditorsPicks : editorsPicks);
  const [articlePost, setArticlePost] = useState<NewsPost | null>(null);
  const weatherCity =
    preferences.travelMode && preferences.passportCity
      ? preferences.passportCity
      : preferences.passportCity ?? 'New York, NY';
  const { weather, isLive } = useDisguiseWeather(weatherCity, locale);
  const { refreshing, justUpdated, scrollViewProps } = usePulseScrollRefresh();

  const openTopic = (topic?: string) => {
    navigateDisguiseFeedTopic(navigation, topic);
  };

  const openBrief = () => {
    setArticlePost(briefToNewsPost(brief));
  };

  const openBreaking = (card: (typeof breakingNowCards)[number]) => {
    setArticlePost(breakingToNewsPost(card));
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <DisguiseHeader title={meta.trendingTab} showSearch={false} />
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        {...scrollViewProps}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>
          {isFemalePulse ? t('disguiseTrending.cosmosTitle') : t('disguiseTrending.trendingTitle')}
        </Text>
        <Text style={[styles.pageSubtitle, { color: colors.textMuted }]}>
          {isFemalePulse ? t('disguiseTrending.cosmosSubtitle') : t('disguiseTrending.trendingSubtitle')}
        </Text>

        <AnimatedPressable
          style={[styles.briefCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={openBrief}
          accessibilityRole="button"
          accessibilityLabel={t('disguiseTrending.readBriefA11y', { headline: brief.headline })}
        >
          <NewsHeroImage uri={brief.imageUrl} style={styles.briefImage} accessibilityLabel={brief.headline} />
          <View style={styles.briefBody}>
            <View style={styles.briefMeta}>
              <View style={[styles.livePill, { backgroundColor: meta.accentSoft }]}>
                <View style={[styles.liveDot, { backgroundColor: meta.accent }]} />
                <Text style={[styles.liveText, { color: meta.accent }]}>
                  {isFemalePulse ? t('disguiseTrending.cosmosBrief') : t('disguiseTrending.pulseBrief')}
                </Text>
              </View>
              <Text style={[styles.briefSource, { color: colors.textMuted }]}>
                {brief.source} · {t('disguiseTrending.readMinutes', { minutes: brief.readMinutes })}
              </Text>
            </View>
            <Text style={[styles.briefHeadline, { color: colors.text }]} numberOfLines={3}>
              {brief.headline}
            </Text>
            <Text style={[styles.briefSummary, { color: colors.textMuted }]} numberOfLines={2}>
              {brief.summary}
            </Text>
          </View>
        </AnimatedPressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {categoryChips.map((chip) => (
            <AnimatedPressable
              key={chip.id}
              style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openTopic(chip.topic)}
            >
              <Ionicons name={chipIcon(chip.icon)} size={14} color={meta.accent} />
              <Text style={[styles.chipLabel, { color: colors.text }]}>
                {getTrendingChipLabel(locale, chip.label)}
              </Text>
            </AnimatedPressable>
          ))}
        </ScrollView>

        {isFemalePulse ? null : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('disguiseTrending.weather')}</Text>
            <DisguiseWeatherPanel
              weather={weather}
              isLive={isLive}
              onPress={() => openTopic('#Weather')}
            />
          </>
        )}

        {isFemalePulse ? null : (
          <>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('disguiseTrending.stockMarket')}</Text>
            <DisguiseMarketsPanel onQuotePress={() => openTopic('#MarketWatch')} />
          </>
        )}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {isFemalePulse ? t('disguiseTrending.tonightForYou') : t('disguiseTrending.localRadar')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.radarRow}>
          {radarItems.map((item) => (
            <AnimatedPressable
              key={item.id}
              style={[styles.radarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openTopic(item.topic)}
            >
              <View style={[styles.radarIcon, { backgroundColor: meta.accentSoft }]}>
                <Ionicons name={radarIcon(item.icon)} size={18} color={meta.accent} />
              </View>
              <Text style={[styles.radarTitle, { color: colors.text }]}>{item.title}</Text>
              <Text style={[styles.radarDetail, { color: colors.textMuted }]}>{item.detail}</Text>
            </AnimatedPressable>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('disguiseTrending.breakingNow')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakingRow}>
          {breakingCards.map((card) => (
            <AnimatedPressable
              key={card.id}
              style={[styles.breakingCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openBreaking(card)}
            >
              <MediaWithContentBadge kind="news">
                <NewsHeroImage uri={card.imageUrl} style={styles.breakingImage} accessibilityLabel={card.headline} />
              </MediaWithContentBadge>
              <View style={styles.breakingBody}>
                <Text style={[styles.breakingSource, { color: colors.textMuted }]}>
                  {card.source} · {card.timeAgo}
                </Text>
                <Text style={[styles.breakingHeadline, { color: colors.text }]} numberOfLines={3}>
                  {card.headline}
                </Text>
              </View>
            </AnimatedPressable>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('disguiseTrending.trendingTopics')}</Text>
        {trendingTopics.map((item, index) => (
          <AnimatedPressable
            key={item.id}
            style={[styles.topicRow, { borderBottomColor: colors.border }]}
            onPress={() => openTopic(item.label)}
          >
            <Text style={[styles.rank, { color: colors.textMuted }]}>{index + 1}</Text>
            {item.imageUrl ? (
              <MediaWithContentBadge kind="trending">
                <NewsHeroImage uri={item.imageUrl} style={styles.topicThumb} accessibilityLabel={item.label} />
              </MediaWithContentBadge>
            ) : (
              <View style={[styles.topicThumbPlaceholder, { backgroundColor: colors.surface }]}>
                <Ionicons name="pricetag-outline" size={16} color={meta.accent} />
              </View>
            )}
            <View style={styles.topicText}>
              <View style={styles.topicTopLine}>
                <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
                {item.changeLabel && (
                  <View style={[styles.trendPill, { backgroundColor: `${trendColor(item.direction, meta.accent)}22` }]}>
                    <Ionicons
                      name={trendIcon(item.direction)}
                      size={10}
                      color={trendColor(item.direction, meta.accent)}
                    />
                    <Text style={[styles.trendPillText, { color: trendColor(item.direction, meta.accent) }]}>
                      {getTrendingChangeLabel(locale, item.changeLabel)}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.preview, { color: colors.textMuted }]} numberOfLines={1}>
                {item.preview}
              </Text>
              <Text style={[styles.posts, { color: colors.textMuted }]}>
                {t('disguiseTrending.postsInCategory', {
                  posts: item.posts,
                  category: getPulseCategoryLabel(locale, item.category),
                })}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </AnimatedPressable>
        ))}

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('disguiseTrending.editorsPicks')}</Text>
        {editorPicks.map((pick) => (
          <AnimatedPressable
            key={pick.id}
            style={[styles.pickRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setArticlePost(editorsPickToNewsPost(pick))}
          >
            <Ionicons name="bookmark-outline" size={18} color={meta.accent} />
            <View style={styles.pickText}>
              <Text style={[styles.pickTitle, { color: colors.text }]}>{pick.title}</Text>
              <Text style={[styles.pickSubtitle, { color: colors.textMuted }]}>{pick.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </AnimatedPressable>
        ))}

        <PulseFeedRefreshFooter refreshing={refreshing} justUpdated={justUpdated} />
      </ScrollView>

      <NewsArticleSheet
        visible={articlePost !== null}
        post={articlePost}
        onClose={() => setArticlePost(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    paddingBottom: spacing.xl * 5,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  pageSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  briefCard: {
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: spacing.lg,
  },
  briefImage: {
    width: '100%',
    height: 160,
  },
  briefBody: {
    padding: spacing.md,
  },
  briefMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.button,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  briefSource: {
    fontSize: 12,
  },
  briefHeadline: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: spacing.xs,
  },
  briefSummary: {
    fontSize: 14,
    lineHeight: 20,
  },
  chipRow: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.button,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  radarRow: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  radarCard: {
    width: 156,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    padding: spacing.md,
  },
  radarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  radarTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  radarDetail: {
    fontSize: 12,
    lineHeight: 16,
  },
  breakingRow: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  breakingCard: {
    width: 220,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  breakingImage: {
    width: '100%',
    height: 100,
  },
  breakingBody: {
    padding: spacing.sm,
  },
  breakingSource: {
    fontSize: 11,
    marginBottom: 4,
  },
  breakingHeadline: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  topicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  rank: {
    fontSize: 16,
    fontWeight: '800',
    width: 22,
  },
  topicThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  topicThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topicText: {
    flex: 1,
  },
  topicTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 15,
    fontWeight: '800',
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  trendPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  preview: {
    fontSize: 13,
    marginTop: 2,
  },
  posts: {
    fontSize: 11,
    marginTop: 2,
  },
  pickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  pickText: {
    flex: 1,
  },
  pickTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  pickSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
