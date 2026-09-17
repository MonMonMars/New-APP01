import { pulseNewsImages } from './pulseNewsMedia';

export type TrendDirection = 'up' | 'down' | 'new' | 'hot' | 'stable';

export type TrendingTopic = {
  id: string;
  label: string;
  posts: string;
  direction: TrendDirection;
  changeLabel?: string;
  category: string;
  preview: string;
  imageUrl?: string;
};

export type TrendingBrief = {
  id: string;
  headline: string;
  summary: string;
  source: string;
  readMinutes: number;
  imageUrl: string;
  topic: string;
};

export type TrendingCategoryChip = {
  id: string;
  label: string;
  icon: 'flash' | 'business' | 'location' | 'restaurant' | 'trending-up' | 'calendar' | 'cloud';
  topic?: string;
};

export type LocalRadarItem = {
  id: string;
  icon: 'train' | 'cloud' | 'ticket' | 'wifi';
  title: string;
  detail: string;
  topic?: string;
};

export type MarketPulse = {
  id: string;
  symbol: string;
  value: string;
  change: string;
  up: boolean;
};

export type BreakingCard = {
  id: string;
  headline: string;
  source: string;
  timeAgo: string;
  topic: string;
  imageUrl: string;
};

export const pulseBrief: TrendingBrief = {
  id: 'brief-1',
  headline: 'Tech giants are spending big on AI in a bid to dominate the boom',
  summary:
    'Meta, Alphabet and Microsoft are ramping up AI capex — investors are watching whether returns keep pace.',
  source: 'BBC News',
  readMinutes: 4,
  imageUrl: pulseNewsImages.cityFinance,
  topic: '#TechNews',
};

export const trendingCategoryChips: TrendingCategoryChip[] = [
  { id: 'c0', label: 'For you', icon: 'flash' },
  { id: 'c1', label: 'Weather', icon: 'cloud', topic: '#Weather' },
  { id: 'c2', label: 'Markets', icon: 'trending-up', topic: '#MarketWatch' },
  { id: 'c3', label: 'Tech', icon: 'business', topic: '#TechNews' },
  { id: 'c4', label: 'Local', icon: 'location', topic: '#CityLife' },
  { id: 'c5', label: 'Food', icon: 'restaurant', topic: '#CoffeeShops' },
  { id: 'c6', label: 'Weekend', icon: 'calendar', topic: '#WeekendPlans' },
];

export const localRadarItems: LocalRadarItem[] = [
  {
    id: 'lr1',
    icon: 'train',
    title: 'Night buses expanded',
    detail: 'Fri–Sat until 3am on 4 routes',
    topic: '#CityLife',
  },
  {
    id: 'lr2',
    icon: 'cloud',
    title: 'Dry evening',
    detail: '18°C · light wind · good for patios',
    topic: '#WeekendPlans',
  },
  {
    id: 'lr3',
    icon: 'ticket',
    title: 'Free gallery nights',
    detail: '12 venues open late downtown',
    topic: '#WeekendPlans',
  },
];

export const marketPulseSnapshots: MarketPulse[] = [
  { id: 'm1', symbol: 'S&P 500', value: '5,842', change: '+0.6%', up: true },
  { id: 'm2', symbol: 'NASDAQ', value: '18,421', change: '+0.9%', up: true },
  { id: 'm3', symbol: 'BTC', value: '$94.2K', change: '-1.2%', up: false },
  { id: 'm4', symbol: 'EUR/USD', value: '1.09', change: '+0.1%', up: true },
];

export const breakingNowCards: BreakingCard[] = [
  {
    id: 'b1',
    headline: 'EU smartphone labels for battery & repairability land in June',
    source: 'NPR',
    timeAgo: '3h',
    topic: '#TechNews',
    imageUrl: pulseNewsImages.phone,
  },
  {
    id: 'b2',
    headline: 'Speedy chorizo with chickpeas — 10-minute pantry supper',
    source: 'BBC Food',
    timeAgo: '5h',
    topic: '#CoffeeShops',
    imageUrl: pulseNewsImages.restaurant,
  },
  {
    id: 'b3',
    headline: 'Night routes return for Bristol commuters',
    source: 'The Guardian',
    timeAgo: '1h',
    topic: '#CityLife',
    imageUrl: pulseNewsImages.transit,
  },
  {
    id: 'b4',
    headline: 'Remote teams rethink async standups',
    source: 'Pulse Community',
    timeAgo: '45m',
    topic: '#DesignTips',
    imageUrl: pulseNewsImages.office,
  },
];

export const disguiseTrendingTopics: TrendingTopic[] = [
  {
    id: 't1',
    label: '#TechNews',
    posts: '18.2K',
    direction: 'hot',
    changeLabel: 'Live',
    category: 'Business',
    preview: 'AI capex surge dominates earnings calls',
    imageUrl: pulseNewsImages.cityFinance,
  },
  {
    id: 't2',
    label: '#WeekendPlans',
    posts: '12.4K',
    direction: 'up',
    changeLabel: '+24%',
    category: 'Lifestyle',
    preview: 'Gallery nights and late ramen runs trending',
    imageUrl: pulseNewsImages.cafe,
  },
  {
    id: 't3',
    label: '#CityLife',
    posts: '9.8K',
    direction: 'up',
    changeLabel: '+18%',
    category: 'Local',
    preview: 'Transit upgrades and night routes in focus',
    imageUrl: pulseNewsImages.transit,
  },
  {
    id: 't4',
    label: '#MarketWatch',
    posts: '8.6K',
    direction: 'new',
    changeLabel: 'New',
    category: 'Markets',
    preview: 'Tech leads indices; crypto cools after rally',
    imageUrl: pulseNewsImages.cityFinance,
  },
  {
    id: 't5',
    label: '#CoffeeShops',
    posts: '5.6K',
    direction: 'stable',
    category: 'Food',
    preview: 'Third-wave counters extend hours downtown',
    imageUrl: pulseNewsImages.cafe,
  },
  {
    id: 't6',
    label: '#DesignTips',
    posts: '4.9K',
    direction: 'up',
    changeLabel: '+11%',
    category: 'Creators',
    preview: 'Spacing, contrast, and mobile-first layouts',
    imageUrl: pulseNewsImages.office,
  },
  {
    id: 't7',
    label: '#AIInvesting',
    posts: '4.1K',
    direction: 'hot',
    changeLabel: 'Live',
    category: 'Finance',
    preview: 'Chip makers and cloud hyperscalers in spotlight',
    imageUrl: pulseNewsImages.chips,
  },
  {
    id: 't8',
    label: '#RemoteWork',
    posts: '3.7K',
    direction: 'down',
    changeLabel: '-6%',
    category: 'Work',
    preview: 'Hybrid policies tighten at large employers',
    imageUrl: pulseNewsImages.office,
  },
  {
    id: 't9',
    label: '#EURegulation',
    posts: '3.2K',
    direction: 'up',
    changeLabel: '+31%',
    category: 'Policy',
    preview: 'Repairability labels reach smartphones',
    imageUrl: pulseNewsImages.phone,
  },
  {
    id: 't10',
    label: '#NightTransit',
    posts: '2.8K',
    direction: 'new',
    changeLabel: 'New',
    category: 'Local',
    preview: 'Late buses and safety at stops debated',
    imageUrl: pulseNewsImages.transit,
  },
  {
    id: 't11',
    label: '#StartupJobs',
    posts: '2.4K',
    direction: 'up',
    changeLabel: '+9%',
    category: 'Careers',
    preview: 'Health-tech hiring picks up in Q3',
    imageUrl: pulseNewsImages.newsroom,
  },
  {
    id: 't12',
    label: '#WeekendEats',
    posts: '2.1K',
    direction: 'stable',
    category: 'Food',
    preview: 'Quick pantry recipes and brunch lists',
    imageUrl: pulseNewsImages.restaurant,
  },
  {
    id: 't13',
    label: '#ClimateTech',
    posts: '1.9K',
    direction: 'up',
    changeLabel: '+14%',
    category: 'Science',
    preview: 'Grid storage startups raise fresh rounds',
    imageUrl: pulseNewsImages.earthTech,
  },
  {
    id: 't14',
    label: '#BookClub',
    posts: '1.6K',
    direction: 'stable',
    category: 'Culture',
    preview: 'Summer reads and indie bookstore picks',
    imageUrl: pulseNewsImages.newspaper,
  },
  {
    id: 't15',
    label: '#TransitTalk',
    posts: '1.4K',
    direction: 'hot',
    changeLabel: 'Live',
    category: 'Local',
    preview: 'Riders debate real-time tracking at night stops',
    imageUrl: pulseNewsImages.transit,
  },
];

export const editorsPicks = [
  {
    id: 'ep1',
    title: 'How to spot reliable sources in your feed',
    subtitle: 'Pulse Trust · 3 min read',
    topic: '#DesignTips',
  },
  {
    id: 'ep2',
    title: 'Weekend transit map: what runs after midnight',
    subtitle: 'Local desk · updated today',
    topic: '#CityLife',
  },
  {
    id: 'ep3',
    title: 'Markets open: what moved overnight',
    subtitle: 'Pulse Finance · morning brief',
    topic: '#MarketWatch',
  },
  {
    id: 'ep4',
    title: 'Brunch walk-ins: editors\' 12-spot list',
    subtitle: 'BBC Food · weekend',
    topic: '#WeekendEats',
  },
  {
    id: 'ep5',
    title: 'EU repair labels: what changes in June',
    subtitle: 'NPR · policy brief',
    topic: '#EURegulation',
  },
  {
    id: 'ep6',
    title: 'Health-tech hiring: roles worth watching',
    subtitle: 'Pulse Careers · Q3',
    topic: '#StartupJobs',
  },
  {
    id: 'ep7',
    title: 'Remote work async guide for hybrid teams',
    subtitle: 'Pulse Work · 5 min',
    topic: '#RemoteWork',
  },
  {
    id: 'ep8',
    title: 'AI investing: chip makers vs cloud',
    subtitle: 'Pulse Finance · deep dive',
    topic: '#AIInvesting',
  },
];
