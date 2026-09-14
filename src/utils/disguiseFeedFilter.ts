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
};

export function filterDisguiseFeed(items: FeedItem[], topic?: string): FeedItem[] {
  if (!topic) {
    return items;
  }
  const predicate = TOPIC_FILTERS[topic];
  if (!predicate) {
    return items;
  }
  const filtered = items.filter(predicate);
  return filtered.length > 0 ? filtered : items;
}

export function topicFilterLabel(topic?: string): string {
  if (!topic) {
    return 'For you';
  }
  return topic.replace('#', '');
}
