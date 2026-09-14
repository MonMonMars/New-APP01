import { FeedItem } from '../data/disguiseFeed';

const TOPIC_FILTERS: Record<string, (item: FeedItem) => boolean> = {
  '#WeekendPlans': (item) =>
    item.type === 'social' || (item.type === 'news' && item.category === 'Lifestyle'),
  '#TechNews': (item) =>
    item.type === 'news' && (item.category === 'Tech' || item.category === 'Business'),
  '#CoffeeShops': (item) =>
    item.type === 'social' ||
    (item.type === 'news' && item.category === 'Lifestyle') ||
    item.type === 'ad',
  '#CityLife': (item) =>
    (item.type === 'news' && item.category === 'Local') || item.type === 'social',
  '#DesignTips': (item) => item.type === 'social' || item.type === 'ad',
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
  return topic ?? 'For you';
}
