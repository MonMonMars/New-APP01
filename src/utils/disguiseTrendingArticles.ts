import { BreakingCard, editorsPicks, TrendingBrief } from '../data/disguiseTrending';
import { NewsPost } from '../data/disguiseFeed';
import { freeNewsUrlForTopic, pulseNewsImages } from '../data/pulseNewsMedia';
import { translate } from '../i18n';
import { localizeTimeAgoLabel } from '../i18n/labels';
import { AppLocale, resolveAppLocale } from '../types/locale';

function topicCategory(topic: string): string {
  switch (topic) {
    case '#TechNews':
    case '#AIInvesting':
    case '#EURegulation':
      return 'Tech';
    case '#MarketWatch':
      return 'Business';
    case '#CityLife':
    case '#NightTransit':
    case '#TransitTalk':
      return 'Local';
    case '#CoffeeShops':
    case '#WeekendEats':
    case '#WeekendPlans':
      return 'Lifestyle';
    case '#ClimateTech':
      return 'Science';
    case '#BookClub':
      return 'Culture';
    case '#DesignTips':
    case '#RemoteWork':
      return 'Creators';
    case '#StartupJobs':
      return 'Business';
    case '#Weather':
      return 'Local';
    case '#Zodiac':
      return '星座';
    case '#Tarot':
      return 'Tarot';
    case '#Film':
    case '#Music':
    case '#Style':
      return 'Entertainment';
    default:
      return 'News';
  }
}

export function briefToNewsPost(brief: TrendingBrief, locale?: AppLocale | null): NewsPost {
  const resolvedLocale = resolveAppLocale(locale);
  const category = topicCategory(brief.topic);

  return {
    id: `trending-brief-${brief.id}`,
    type: 'news',
    source: brief.source,
    headline: brief.headline,
    summary: brief.summary,
    articleBody: `${brief.summary}\n\n${translate(resolvedLocale, 'trendingArticle.briefFooter', { source: brief.source })}`,
    imageUrl: brief.imageUrl,
    timeAgo: `${brief.readMinutes} min read`,
    category,
    articleUrl: freeNewsUrlForTopic(brief.topic),
    reporters: [],
  };
}

export function editorsPickToNewsPost(
  pick: (typeof editorsPicks)[number],
  locale?: AppLocale | null,
): NewsPost {
  const resolvedLocale = resolveAppLocale(locale);
  const category = topicCategory(pick.topic);
  const source = pick.subtitle.split(' · ')[0] ?? 'Pulse';

  return {
    id: `trending-pick-${pick.id}`,
    type: 'news',
    source,
    headline: pick.title,
    summary: pick.subtitle,
    articleBody: `${pick.title}\n\n${pick.subtitle}\n\n${translate(resolvedLocale, 'trendingArticle.editorsPickFooter', { source })}`,
    imageUrl: pulseNewsImages.newspaper,
    timeAgo: 'Editor\'s pick',
    category,
    articleUrl: freeNewsUrlForTopic(pick.topic),
    reporters: [],
  };
}

export function breakingToNewsPost(card: BreakingCard, locale?: AppLocale | null): NewsPost {
  const resolvedLocale = resolveAppLocale(locale);
  const category = topicCategory(card.topic);
  const localizedTime = localizeTimeAgoLabel(resolvedLocale, card.timeAgo);

  return {
    id: `trending-breaking-${card.id}`,
    type: 'news',
    source: card.source,
    headline: card.headline,
    summary: card.headline,
    articleBody: translate(resolvedLocale, 'trendingArticle.breakingFooter', {
      headline: card.headline,
      time: localizedTime,
      source: card.source,
    }),
    imageUrl: card.imageUrl,
    timeAgo: card.timeAgo,
    category,
    articleUrl: freeNewsUrlForTopic(card.topic),
    reporters: [],
  };
}
