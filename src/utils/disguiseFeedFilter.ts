import { FeedItem } from '../data/disguiseFeed';

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
  '#Weather': (item) =>
    (item.type === 'news' && item.category === 'Local') ||
    item.type === 'social' ||
    (item.type === 'news' && item.category === 'Lifestyle'),
};

export function filterDisguiseFeed(items: FeedItem[], topic?: string): FeedItem[] {
  if (!topic) {
    return items;
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
