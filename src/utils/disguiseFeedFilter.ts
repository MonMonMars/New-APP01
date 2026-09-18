import { FeedItem } from '../data/disguiseFeed';
import type { ProfileGender } from '../types/profile';
import { isCosmosTarotFeedItem, isFemaleOnlyPulseTopic } from './disguiseFeedCatalog';
import { usesFemalePulseExperience } from './genderAccountPerks';

const TOPIC_FILTERS: Record<string, (item: FeedItem) => boolean> = {
  '#WeekendPlans': (item) =>
    item.type === 'social' ||
    (item.type === 'news' && item.category === 'Lifestyle') ||
    item.type === 'disguised_profile',
  '#TechNews': (item) =>
    item.type === 'news' && (item.category === 'Tech' || item.category === 'Business'),
  '#CoffeeShops': (item) =>
    item.type === 'social' ||
    (item.type === 'news' && item.category === 'Lifestyle') ||
    item.type === 'ad',
  '#CityLife': (item) =>
    (item.type === 'news' && item.category === 'Local') ||
    item.type === 'social' ||
    item.type === 'disguised_profile',
  '#DesignTips': (item) =>
    item.type === 'social' || item.type === 'ad' || item.type === 'disguised_profile',
  '#MarketWatch': (item) =>
    (item.type === 'news' && item.category === 'Business') || item.type === 'ad',
  '#AIInvesting': (item) =>
    item.type === 'news' && (item.category === 'Business' || item.category === 'Tech'),
  '#RemoteWork': (item) => item.type === 'social' || item.type === 'disguised_profile',
  '#EURegulation': (item) => item.type === 'news' && item.category === 'Tech',
  '#NightTransit': (item) => item.type === 'news' && item.category === 'Local',
  '#StartupJobs': (item) => item.type === 'news' && item.category === 'Business',
  '#WeekendEats': (item) =>
    (item.type === 'news' && item.category === 'Lifestyle') || item.type === 'social',
  '#ClimateTech': (item) =>
    item.type === 'news' &&
    (item.category === 'Tech' ||
      item.category === 'Business' ||
      item.headline.toLowerCase().includes('climate') ||
      item.headline.toLowerCase().includes('energy')),
  '#BookClub': (item) =>
    item.type === 'social' ||
    (item.type === 'news' && (item.category === 'Lifestyle' || item.category === 'Culture')),
  '#TransitTalk': (item) =>
    (item.type === 'news' && item.category === 'Local') ||
    item.type === 'social' ||
    item.type === 'disguised_profile',
  '#OnDeviceAI': (item) =>
    item.type === 'news' && (item.category === 'Tech' || item.category === 'Business'),
  '#HeatWave': (item) =>
    item.type === 'news' &&
    (item.category === 'Weather' || item.headline.toLowerCase().includes('heat')),
  '#CarFreeCities': (item) =>
    item.type === 'news' && item.category === 'Local',
  '#IndieBooks': (item) =>
    item.type === 'news' && item.category === 'Culture',
  '#SolarHome': (item) =>
    item.type === 'news' &&
    (item.category === 'Climate' || item.headline.toLowerCase().includes('solar')),
  '#Weather': (item) =>
    (item.type === 'news' && item.category === 'Local') ||
    item.type === 'social' ||
    (item.type === 'news' && item.category === 'Lifestyle'),
  '#Zodiac': (item) =>
    item.type === 'news' && (item.category === '星座' || item.source.includes('Cosmos')),
  '#Tarot': (item) =>
    item.type === 'news' && (item.category === 'Tarot' || item.source.includes('Tarot')),
  '#Film': (item) =>
    item.type === 'news' &&
    (item.category === 'Entertainment' || item.headline.toLowerCase().includes('film')),
  '#Music': (item) =>
    item.type === 'news' &&
    (item.category === 'Entertainment' ||
      item.headline.toLowerCase().includes('festival') ||
      item.headline.toLowerCase().includes('music')),
  '#Style': (item) =>
    item.type === 'news' &&
    (item.category === 'Entertainment' ||
      item.headline.toLowerCase().includes('red carpet') ||
      item.headline.toLowerCase().includes('fashion')),
};

function newsWithoutCosmos(items: FeedItem[]): FeedItem[] {
  return items.filter((item) => item.type === 'news' && !isCosmosTarotFeedItem(item));
}

export function filterDisguiseFeed(
  items: FeedItem[],
  topic?: string,
  gender?: ProfileGender | null,
): FeedItem[] {
  if (!topic) {
    return items;
  }

  if (isFemaleOnlyPulseTopic(topic) && !usesFemalePulseExperience(gender)) {
    const newsItems = newsWithoutCosmos(items);
    return newsItems.length > 0 ? newsItems.slice(0, 8) : items.slice(0, 6);
  }

  const predicate = TOPIC_FILTERS[topic];
  if (!predicate) {
    const keyword = topic.replace('#', '').toLowerCase();
    const keywordFiltered = items.filter((item) => {
      const haystack = feedSearchText(item).toLowerCase();
      return haystack.includes(keyword);
    });
    return keywordFiltered.length > 0 ? keywordFiltered : items.slice(0, 6);
  }

  const filtered = items.filter(predicate);
  return filtered.length > 0 ? filtered : items.slice(0, 6);
}

function feedSearchText(item: FeedItem): string {
  switch (item.type) {
    case 'news':
      return `${item.headline} ${item.summary} ${item.category} ${item.source}`;
    case 'social':
      return `${item.body} ${item.author} ${item.handle}`;
    case 'ad':
      return `${item.brand} ${item.tagline} ${item.description}`;
    case 'disguised_profile':
      return `${item.headline} ${item.summary} ${item.name} ${item.sourceLabel}`;
    default: {
      const _exhaustive: never = item;
      return _exhaustive;
    }
  }
}

export function topicFilterLabel(topic?: string): string {
  if (!topic) {
    return 'For you';
  }
  return topic.replace('#', '');
}
