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
  accent: string;
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
  imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c9aeeda0bf6?w=800&q=80',
  topic: '#TechNews',
};

export const trendingCategoryChips: TrendingCategoryChip[] = [
  { id: 'c0', label: 'For you', icon: 'flash' },
  { id: 'c1', label: 'Weather', icon: 'cloud', topic: '#WeekendPlans' },
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
    accent: '#3b82f6',
  },
  {
    id: 'lr2',
    icon: 'cloud',
    title: 'Dry evening',
    detail: '18°C · light wind · good for patios',
    topic: '#WeekendPlans',
    accent: '#22c55e',
  },
  {
    id: 'lr3',
    icon: 'ticket',
    title: 'Free gallery nights',
    detail: '12 venues open late downtown',
    topic: '#WeekendPlans',
    accent: '#a855f7',
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
    source: 'The Verge',
    timeAgo: '3h',
    topic: '#TechNews',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80',
  },
  {
    id: 'b2',
    headline: 'Speedy chorizo with chickpeas — 10-minute pantry supper',
    source: 'BBC Good Food',
    timeAgo: '5h',
    topic: '#CoffeeShops',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
  },
  {
    id: 'b3',
    headline: 'Night routes return for Bristol commuters',
    source: 'BBC News',
    timeAgo: '1h',
    topic: '#CityLife',
    imageUrl: 'https://images.unsplash.com/photo-1544627677-05470f41cd8a?w=400&q=80',
  },
  {
    id: 'b4',
    headline: 'Remote teams rethink async standups',
    source: 'Pulse Community',
    timeAgo: '45m',
    topic: '#DesignTips',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c9aeeda0bf6?w=200&q=80',
  },
  {
    id: 't2',
    label: '#WeekendPlans',
    posts: '12.4K',
    direction: 'up',
    changeLabel: '+24%',
    category: 'Lifestyle',
    preview: 'Gallery nights and late ramen runs trending',
  },
  {
    id: 't3',
    label: '#CityLife',
    posts: '9.8K',
    direction: 'up',
    changeLabel: '+18%',
    category: 'Local',
    preview: 'Transit upgrades and night routes in focus',
    imageUrl: 'https://images.unsplash.com/photo-1544627677-05470f41cd8a?w=200&q=80',
  },
  {
    id: 't4',
    label: '#MarketWatch',
    posts: '8.6K',
    direction: 'new',
    changeLabel: 'New',
    category: 'Markets',
    preview: 'Tech leads indices; crypto cools after rally',
  },
  {
    id: 't5',
    label: '#CoffeeShops',
    posts: '5.6K',
    direction: 'stable',
    category: 'Food',
    preview: 'Third-wave counters extend hours downtown',
  },
  {
    id: 't6',
    label: '#DesignTips',
    posts: '4.9K',
    direction: 'up',
    changeLabel: '+11%',
    category: 'Creators',
    preview: 'Spacing, contrast, and mobile-first layouts',
  },
  {
    id: 't7',
    label: '#AIInvesting',
    posts: '4.1K',
    direction: 'hot',
    changeLabel: 'Live',
    category: 'Finance',
    preview: 'Chip makers and cloud hyperscalers in spotlight',
  },
  {
    id: 't8',
    label: '#RemoteWork',
    posts: '3.7K',
    direction: 'down',
    changeLabel: '-6%',
    category: 'Work',
    preview: 'Hybrid policies tighten at large employers',
  },
  {
    id: 't9',
    label: '#EURegulation',
    posts: '3.2K',
    direction: 'up',
    changeLabel: '+31%',
    category: 'Policy',
    preview: 'Repairability labels reach smartphones',
  },
  {
    id: 't10',
    label: '#NightTransit',
    posts: '2.8K',
    direction: 'new',
    changeLabel: 'New',
    category: 'Local',
    preview: 'Late buses and safety at stops debated',
  },
  {
    id: 't11',
    label: '#StartupJobs',
    posts: '2.4K',
    direction: 'up',
    changeLabel: '+9%',
    category: 'Careers',
    preview: 'Health-tech hiring picks up in Q3',
  },
  {
    id: 't12',
    label: '#WeekendEats',
    posts: '2.1K',
    direction: 'stable',
    category: 'Food',
    preview: 'Quick pantry recipes and brunch lists',
  },
  {
    id: 't13',
    label: '#ClimateTech',
    posts: '1.9K',
    direction: 'up',
    changeLabel: '+14%',
    category: 'Science',
    preview: 'Grid storage startups raise fresh rounds',
  },
  {
    id: 't14',
    label: '#BookClub',
    posts: '1.6K',
    direction: 'stable',
    category: 'Culture',
    preview: 'Summer reads and indie bookstore picks',
  },
  {
    id: 't15',
    label: '#TransitTalk',
    posts: '1.4K',
    direction: 'hot',
    changeLabel: 'Live',
    category: 'Local',
    preview: 'Riders debate real-time tracking at night stops',
    imageUrl: 'https://images.unsplash.com/photo-1544627677-05470f41cd8a?w=200&q=80',
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
    subtitle: 'BBC Good Food · weekend',
    topic: '#WeekendEats',
  },
  {
    id: 'ep5',
    title: 'EU repair labels: what changes in June',
    subtitle: 'The Verge · policy brief',
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
