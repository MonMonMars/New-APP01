import { pulseNewsImages } from './pulseNewsMedia';
import type {
  BreakingCard,
  LocalRadarItem,
  TrendingBrief,
  TrendingCategoryChip,
  TrendingTopic,
} from './disguiseTrending';

export const femalePulseBrief: TrendingBrief = {
  id: 'f-brief-1',
  headline: 'Virgo season check-in: what to release before the new moon',
  summary:
    'Earth signs get a practical reset — tarot says drop one obligation that exists out of guilt, not joy.',
  source: 'Pulse Cosmos',
  readMinutes: 3,
  imageUrl: pulseNewsImages.stars,
  topic: '#Zodiac',
};

export const femaleTrendingCategoryChips: TrendingCategoryChip[] = [
  { id: 'fc0', label: 'For you', icon: 'flash' },
  { id: 'fc1', label: '星座', icon: 'flash', topic: '#Zodiac' },
  { id: 'fc2', label: 'Tarot', icon: 'calendar', topic: '#Tarot' },
  { id: 'fc3', label: 'Film', icon: 'business', topic: '#Film' },
  { id: 'fc4', label: 'Music', icon: 'restaurant', topic: '#Music' },
  { id: 'fc5', label: 'Style', icon: 'location', topic: '#Style' },
  { id: 'fc6', label: 'Weekend', icon: 'calendar', topic: '#WeekendPlans' },
];

export const femaleBreakingNowCards: BreakingCard[] = [
  {
    id: 'fb1',
    headline: 'Card of the day: The Star — renewal after a quiet chapter',
    source: 'Pulse Tarot',
    timeAgo: '20m',
    topic: '#Tarot',
    imageUrl: pulseNewsImages.tarot,
  },
  {
    id: 'fb2',
    headline: 'Festival previews: line-ups worth bookmarking now',
    source: 'BBC Culture',
    timeAgo: '1h',
    topic: '#Music',
    imageUrl: pulseNewsImages.concert,
  },
  {
    id: 'fb3',
    headline: 'Five films streaming this week worth the runtime',
    source: 'The Guardian',
    timeAgo: '2h',
    topic: '#Film',
    imageUrl: pulseNewsImages.cinema,
  },
  {
    id: 'fb4',
    headline: 'Libra moon tonight: social energy without the spiral',
    source: 'Pulse Cosmos',
    timeAgo: '45m',
    topic: '#Zodiac',
    imageUrl: pulseNewsImages.moon,
  },
];

export const femaleCosmosRadarItems: LocalRadarItem[] = [
  {
    id: 'fr1',
    icon: 'cloud',
    title: 'Moon in Libra',
    detail: 'Social energy peaks after 8pm — good for dates',
    topic: '#Zodiac',
  },
  {
    id: 'fr2',
    icon: 'ticket',
    title: 'Free tarot livestream',
    detail: 'Pulse Cosmos · tonight 9pm ET',
    topic: '#Tarot',
  },
  {
    id: 'fr3',
    icon: 'wifi',
    title: 'Festival streams',
    detail: 'BBC Culture · 3 free concerts this weekend',
    topic: '#Music',
  },
  {
    id: 'fr4',
    icon: 'train',
    title: 'Late-night cinema',
    detail: 'Indie theaters open until midnight Fri–Sat',
    topic: '#Film',
  },
];

export const femaleTrendingTopics: TrendingTopic[] = [
  {
    id: 'ft1',
    label: '#Zodiac',
    posts: '12.4K',
    direction: 'hot',
    changeLabel: 'Rising',
    category: '星座',
    preview: 'Virgo weekly, Libra moon, compatibility threads',
    imageUrl: pulseNewsImages.stars,
  },
  {
    id: 'ft2',
    label: '#Tarot',
    posts: '8.1K',
    direction: 'up',
    changeLabel: '+18%',
    category: 'Tarot',
    preview: 'Card of the day, three-card spreads, love pulls',
    imageUrl: pulseNewsImages.tarot,
  },
  {
    id: 'ft3',
    label: '#Film',
    posts: '6.7K',
    direction: 'new',
    changeLabel: 'New',
    category: 'Entertainment',
    preview: 'Streaming picks, red carpet recaps, comfort rewatches',
    imageUrl: pulseNewsImages.cinema,
  },
  {
    id: 'ft4',
    label: '#Music',
    posts: '5.2K',
    direction: 'up',
    changeLabel: '+9%',
    category: 'Entertainment',
    preview: 'Festival previews, album drops, free livestreams',
    imageUrl: pulseNewsImages.concert,
  },
  {
    id: 'ft5',
    label: '#Style',
    posts: '4.8K',
    direction: 'stable',
    category: 'Entertainment',
    preview: 'Red carpet looks, humidity-proof hair, video-date makeup',
    imageUrl: pulseNewsImages.fashion,
  },
];

export const femaleEditorsPicks = [
  {
    id: 'fep1',
    title: 'Your sign\'s love language this week',
    subtitle: 'Pulse Cosmos · 3 min read',
    topic: '#Zodiac',
  },
  {
    id: 'fep2',
    title: 'Weekend tarot: past, present, possible',
    subtitle: 'Pulse Tarot · pull your three cards',
    topic: '#Tarot',
  },
  {
    id: 'fep3',
    title: 'Five films worth the runtime',
    subtitle: 'The Guardian · streaming this week',
    topic: '#Film',
  },
];
