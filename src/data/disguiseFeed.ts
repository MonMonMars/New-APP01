export type NewsPost = {
  id: string;
  type: 'news';
  source: string;
  headline: string;
  summary: string;
  imageUrl: string;
  timeAgo: string;
  category: string;
};

export type AdPost = {
  id: string;
  type: 'ad';
  brand: string;
  tagline: string;
  imageUrl: string;
  cta: string;
  sponsored: true;
};

export type SocialPost = {
  id: string;
  type: 'social';
  author: string;
  handle: string;
  avatarUrl: string;
  body: string;
  imageUrl?: string;
  likes: number;
  comments: number;
  timeAgo: string;
};

export type FeedItem = NewsPost | AdPost | SocialPost;

export const DISGUISE_APP_NAME = 'Pulse';

export const disguiseFeedItems: FeedItem[] = [
  {
    id: 'news-1',
    type: 'news',
    source: 'Reuters',
    headline: 'Markets steady as tech earnings beat expectations',
    summary: 'Major indices closed flat as investors weighed strong cloud revenue against cautious forward guidance from chip makers.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c9aeeda0bf6?w=800&q=80',
    timeAgo: '12m ago',
    category: 'Business',
  },
  {
    id: 'ad-1',
    type: 'ad',
    brand: 'NordVPN',
    tagline: 'Browse privately on public Wi‑Fi. 2 years + 3 months free.',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3d58c?w=800&q=80',
    cta: 'Learn more',
    sponsored: true,
  },
  {
    id: 'social-1',
    type: 'social',
    author: 'Alex Chen',
    handle: '@alexchen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    body: 'Finally tried that ramen spot everyone keeps posting about. Worth the queue — the broth is unreal.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    likes: 284,
    comments: 41,
    timeAgo: '34m ago',
  },
  {
    id: 'news-2',
    type: 'news',
    source: 'BBC News',
    headline: 'City announces expanded night bus routes for weekends',
    summary: 'Transit officials say the pilot program will run through summer, with stops added near major entertainment districts.',
    imageUrl: 'https://images.unsplash.com/photo-1544627677-05470f41cd8a?w=800&q=80',
    timeAgo: '1h ago',
    category: 'Local',
  },
  {
    id: 'ad-2',
    type: 'ad',
    brand: 'Spotify Premium',
    tagline: '3 months free. Cancel anytime. Listen offline on your commute.',
    imageUrl: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=800&q=80',
    cta: 'Try free',
    sponsored: true,
  },
  {
    id: 'social-2',
    type: 'social',
    author: 'Maya Okonkwo',
    handle: '@maya_o',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    body: 'Hot take: the best productivity hack is still a 20‑minute walk without your phone.',
    likes: 1204,
    comments: 89,
    timeAgo: '2h ago',
  },
  {
    id: 'news-3',
    type: 'news',
    source: 'The Verge',
    headline: 'New EU rules push phone makers toward longer software support',
    summary: 'Manufacturers will need to provide security updates for at least five years on many device categories.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    timeAgo: '3h ago',
    category: 'Tech',
  },
  {
    id: 'ad-3',
    type: 'ad',
    brand: 'Airbnb',
    tagline: 'Weekend getaways under $150/night. Flexible cancellation.',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
    cta: 'Explore stays',
    sponsored: true,
  },
  {
    id: 'social-3',
    type: 'social',
    author: 'Jordan Lee',
    handle: '@jordanlee',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    body: 'Shipped a small UI refresh today. Nothing flashy — just cleaner spacing and better contrast. Details matter.',
    likes: 567,
    comments: 23,
    timeAgo: '4h ago',
  },
  {
    id: 'news-4',
    type: 'news',
    source: 'NYT Cooking',
    headline: 'Five pantry dinners you can make in under 30 minutes',
    summary: 'From chickpea curry to sheet-pan gnocchi, these recipes minimize prep without sacrificing flavor.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    timeAgo: '5h ago',
    category: 'Lifestyle',
  },
];

export const disguiseTrendingTopics = [
  { id: 't1', label: '#WeekendPlans', posts: '12.4K' },
  { id: 't2', label: '#TechNews', posts: '8.1K' },
  { id: 't3', label: '#CoffeeShops', posts: '5.6K' },
  { id: 't4', label: '#CityLife', posts: '4.2K' },
  { id: 't5', label: '#DesignTips', posts: '3.9K' },
];

export const disguiseAlerts = [
  { id: 'a1', icon: 'heart-outline' as const, text: 'Alex Chen liked your comment', time: '2m ago' },
  { id: 'a2', icon: 'person-add-outline' as const, text: 'Maya Okonkwo started following you', time: '1h ago' },
  { id: 'a3', icon: 'chatbubble-outline' as const, text: 'New reply on your post', time: '3h ago' },
  { id: 'a4', icon: 'newspaper-outline' as const, text: 'Morning briefing is ready', time: '6h ago' },
  { id: 'a5', icon: 'megaphone-outline' as const, text: 'Spotify: your wrapped preview is live', time: '1d ago' },
];
