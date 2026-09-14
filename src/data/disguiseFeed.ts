import { disguiseClientAds } from './disguiseClientAds';

export type NewsReporter = {
  id: string;
  name: string;
  avatarUrl: string;
  quote: string;
  photos: string[];
};

export type NewsPost = {
  id: string;
  type: 'news';
  source: string;
  headline: string;
  summary: string;
  articleBody: string;
  imageUrl: string;
  timeAgo: string;
  category: string;
  articleUrl: string;
  reporters: NewsReporter[];
};

export type AdPost = {
  id: string;
  type: 'ad';
  brand: string;
  tagline: string;
  imageUrl: string;
  cta: string;
  landingUrl: string;
  sponsored: true;
};

export type SocialAvatarMask = {
  variant: 'news' | 'ad';
  text: string;
};

export type SocialPost = {
  id: string;
  type: 'social';
  author: string;
  handle: string;
  avatarUrl: string;
  avatarMask?: SocialAvatarMask;
  /** When false, avatarUrl is already a baked disguise image. */
  maskAvatar?: boolean;
  body: string;
  imageUrl?: string;
  imageMask?: SocialAvatarMask;
  likes: number;
  comments: number;
  timeAgo: string;
};

export type FeedItem = NewsPost | AdPost | SocialPost;

export const DISGUISE_APP_NAME = 'Pulse';

const newsItems: NewsPost[] = [
  {
    id: 'news-1',
    type: 'news',
    source: 'Reuters',
    headline: 'Big Tech may be breaking the bank for AI, but investors love it',
    summary:
      'Microsoft, Meta, Amazon and Alphabet reported strong cloud and ad revenue as AI spending climbs — and markets are largely buying the story.',
    articleBody:
      'Microsoft, Meta, Amazon and Alphabet all reported quarterly earnings this week, and the headline is the same across the board: AI spending is enormous, but revenue is keeping pace.\n\nCloud divisions posted double-digit growth as enterprises rush to deploy generative tools. Advertising businesses held steady despite macro uncertainty. Investors sent shares higher in after-hours trading, betting that the capex cycle will pay off over the next two years.\n\nAnalysts note that the gap between AI investment and proven returns is widening — yet few are willing to bet against the hyperscalers while demand for compute remains insatiable.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c9aeeda0bf6?w=800&q=80',
    timeAgo: '12m ago',
    category: 'Business',
    articleUrl:
      'https://www.reuters.com/business/retail-consumer/big-tech-may-be-breaking-bank-ai-investors-love-it-2025-07-31/',
    reporters: [
      {
        id: 'rep-1a',
        name: 'Priya N.',
        avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80',
        quote: 'Capex is wild but the cloud numbers justify it',
        photos: [
          'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80',
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80',
        ],
      },
      {
        id: 'rep-1b',
        name: 'Marcus T.',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
        quote: 'Markets are pricing in a soft landing for AI spend',
        photos: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
        ],
      },
    ],
  },
  {
    id: 'news-2',
    type: 'news',
    source: 'BBC News',
    headline: "New night routes and earlier starts for Bristol's buses",
    summary:
      'First Bus is adding overnight Friday and Saturday services and extending routes to better serve the city’s night-time economy.',
    articleBody:
      'First Bus has announced expanded night services across Bristol, with new routes running until 3 a.m. on Fridays and Saturdays.\n\nEarlier weekday starts on key commuter lines will begin next month, aimed at hospital and hospitality workers. The operator says the changes respond to years of community feedback about gaps after midnight.\n\nCity councillors welcomed the move but called for clearer real-time tracking at late-night stops.',
    imageUrl: 'https://images.unsplash.com/photo-1544627677-05470f41cd8a?w=800&q=80',
    timeAgo: '1h ago',
    category: 'Local',
    articleUrl: 'https://www.bbc.co.uk/news/articles/cz0y7kl938do',
    reporters: [
      {
        id: 'rep-2a',
        name: 'Elena R.',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80',
        quote: 'Finally a bus home after closing time',
        photos: [
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80',
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
        ],
      },
    ],
  },
  {
    id: 'news-3',
    type: 'news',
    source: 'The Verge',
    headline: 'New smartphone labels for battery life and repairability are coming to the EU',
    summary:
      'From June 20, phones sold in the EU must meet ecodesign standards — including longer software support and repairability ratings.',
    articleBody:
      'Starting June 20, every smartphone and tablet sold in the European Union must display an energy label similar to those on appliances, rating battery endurance and ease of repair.\n\nManufacturers will also be required to provide at least five years of security updates for mid-range devices and seven for flagships. Spare parts must be available to independent repair shops within two weeks of a request.\n\nConsumer groups say the rules could push global design changes, as brands rarely maintain separate hardware SKUs for a single region.',
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    timeAgo: '3h ago',
    category: 'Tech',
    articleUrl:
      'https://www.theverge.com/news/655275/smartphone-tablet-labels-eu-energy-efficiency-battery-life-repairability',
    reporters: [
      {
        id: 'rep-3a',
        name: 'Sam K.',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
        quote: 'Repair scores will change how I pick phones',
        photos: [
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
          'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&q=80',
        ],
      },
      {
        id: 'rep-3b',
        name: 'Noor H.',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
        quote: 'Five-year updates should be the global baseline',
        photos: [
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80',
        ],
      },
    ],
  },
  {
    id: 'news-4',
    type: 'news',
    source: 'NYT Cooking',
    headline: 'Pasta with chorizo, chickpeas and kale',
    summary:
      'A 30-minute pantry dinner: dried chorizo, canned chickpeas and kale tossed with short pasta and shaved Manchego.',
    articleBody:
      'This weeknight pasta leans on pantry staples: dried chorizo, canned chickpeas, and sturdy kale that wilts into the sauce without turning mushy.\n\nBrown the chorizo first to render its fat, then sauté garlic and kale until just tender. Add chickpeas and a splash of pasta water to emulsify a glossy coating. Toss with short pasta — orecchiette or rigatoni work well — and finish with shaved Manchego and lemon zest.\n\nFrom start to finish, expect about 30 minutes and one skillet plus a pot.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    timeAgo: '5h ago',
    category: 'Lifestyle',
    articleUrl: 'https://cooking.nytimes.com/recipes/1020999-pasta-with-chorizo-chickpeas-and-kale',
    reporters: [
      {
        id: 'rep-4a',
        name: 'Luca M.',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
        quote: 'Chorizo fat makes the whole sauce',
        photos: [
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80',
        ],
      },
    ],
  },
];

const adItems: AdPost[] = disguiseClientAds.map((campaign) => ({
  id: campaign.id,
  type: 'ad',
  brand: campaign.brand,
  tagline: campaign.tagline,
  imageUrl: campaign.imageUrl,
  cta: campaign.cta,
  landingUrl: campaign.landingUrl,
  sponsored: true,
}));

const socialItems: SocialPost[] = [
  {
    id: 'social-1',
    type: 'social',
    author: 'Alex Chen',
    handle: '@alexchen',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    avatarMask: { variant: 'news', text: 'City food scene heats up' },
    body: 'Finally tried that ramen spot everyone keeps posting about. Worth the queue — the broth is unreal.',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    imageMask: { variant: 'ad', text: 'Free delivery tonight' },
    likes: 284,
    comments: 41,
    timeAgo: '34m ago',
  },
  {
    id: 'social-2',
    type: 'social',
    author: 'Maya Okonkwo',
    handle: '@maya_o',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80',
    avatarMask: { variant: 'ad', text: 'Wellness week sale' },
    body: 'Hot take: the best productivity hack is still a 20‑minute walk without your phone.',
    likes: 1204,
    comments: 89,
    timeAgo: '2h ago',
  },
  {
    id: 'social-3',
    type: 'social',
    author: 'Jordan Lee',
    handle: '@jordanlee',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    avatarMask: { variant: 'news', text: 'Tech hiring surges' },
    body: 'Shipped a small UI refresh today. Nothing flashy — just cleaner spacing and better contrast. Details matter.',
    likes: 567,
    comments: 23,
    timeAgo: '4h ago',
  },
];

export const disguiseFeedItems: FeedItem[] = [
  newsItems[0],
  adItems[0],
  socialItems[0],
  newsItems[1],
  adItems[1],
  socialItems[1],
  newsItems[2],
  adItems[2],
  socialItems[2],
  newsItems[3],
];

export type DisguiseAlert = {
  id: string;
  icon: 'arrow-up-outline' | 'person-add-outline' | 'chatbubble-outline' | 'newspaper-outline' | 'megaphone-outline';
  text: string;
  time: string;
  articleUrl?: string;
  landingUrl?: string;
};

export const disguiseTrendingTopics = [
  { id: 't1', label: '#WeekendPlans', posts: '12.4K' },
  { id: 't2', label: '#TechNews', posts: '8.1K' },
  { id: 't3', label: '#CoffeeShops', posts: '5.6K' },
  { id: 't4', label: '#CityLife', posts: '4.2K' },
  { id: 't5', label: '#DesignTips', posts: '3.9K' },
];

export function findNewsPostByArticleUrl(articleUrl: string): NewsPost | undefined {
  return newsItems.find((item) => item.articleUrl === articleUrl);
}

export const disguiseAlerts: DisguiseAlert[] = [
  { id: 'a1', icon: 'arrow-up-outline', text: 'Alex Chen upvoted your comment', time: '2m ago' },
  { id: 'a2', icon: 'person-add-outline', text: 'Maya Okonkwo started following you', time: '1h ago' },
  { id: 'a3', icon: 'chatbubble-outline', text: 'New reply on your post', time: '3h ago' },
  {
    id: 'a4',
    icon: 'newspaper-outline',
    text: 'Reuters: Big Tech AI spending story trending',
    time: '6h ago',
    articleUrl:
      'https://www.reuters.com/business/retail-consumer/big-tech-may-be-breaking-bank-ai-investors-love-it-2025-07-31/',
  },
  {
    id: 'a5',
    icon: 'megaphone-outline',
    text: 'Spotify Premium: 3 months free offer',
    time: '1d ago',
    landingUrl: 'https://www.spotify.com/premium/',
  },
];
