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
  description: string;
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

export type DisguisedProfileVariant = 'news' | 'ad' | 'social';

export type DisguisedProfilePost = {
  id: string;
  type: 'disguised_profile';
  name: string;
  avatarUrl: string;
  variant: DisguisedProfileVariant;
  overlayText: string;
  sourceLabel: string;
  headline: string;
  summary: string;
  timeAgo: string;
  photos: string[];
  /** Stock hero image for news/ad cards — never the profile photo. */
  coverImageUrl: string;
  category?: string;
  handle?: string;
  cta?: string;
};

export type FeedItem = NewsPost | AdPost | SocialPost | DisguisedProfilePost;

export const DISGUISE_APP_NAME = 'Pulse';

const newsItems: NewsPost[] = [
  {
    id: 'news-1',
    type: 'news',
    source: 'BBC News',
    headline: 'Tech giants are spending big on AI in a bid to dominate the boom',
    summary:
      'Meta, Alphabet and Microsoft are ramping up AI spending on data centres and chips — even as investors question how long the returns will take.',
    articleBody:
      'The titans of the technology sector are ramping up their spending on artificial intelligence, as they rush to reap the benefits of an AI boom that has pushed stocks to record highs.\n\nEarnings reports from Meta, Alphabet and Microsoft reaffirmed the colossal amounts of money these firms are spending on everything from data centres to chips, even as questions swirl about returns on the investments.\n\nMeta said its capital expenditures for 2025 will be between $70bn and $72bn, up from an earlier estimate. Alphabet raised its forecast to $91bn to $93bn. Microsoft reported quarterly capital expenditures of $34.9bn, up from $24bn in the previous quarter.\n\nExuberance among investors about massive AI spending has helped all three tech firms outperform the broader S&P 500 index — but analysts continue to watch whether revenue growth can keep pace with the capex surge.',
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c9aeeda0bf6?w=800&q=80',
    timeAgo: '12m ago',
    category: 'Business',
    articleUrl: 'https://www.bbc.co.uk/news/articles/c5yp2y8rdpro',
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
    source: 'BBC Good Food',
    headline: 'Speedy chorizo with chickpeas',
    summary:
      'A 10-minute pantry supper: chorizo, chickpeas, tomatoes and cabbage bubble together for a quick bowl with crusty bread.',
    articleBody:
      'This speedy supper from BBC Good Food is ready in about 10 minutes and leans on pantry staples you likely already have.\n\nPut a medium pan on the heat and tip in chopped tomatoes followed by a canful of water. While the tomatoes heat, chop the chorizo into chunky pieces and shred the cabbage.\n\nPile the chorizo and cabbage into the pan with chilli flakes and drained chickpeas, then crumble in a stock cube. Stir well, cover and leave to bubble over a high heat for 6 minutes until the cabbage is just tender.\n\nLadle into bowls and eat with crusty or garlic bread. For an Indian-inspired twist, swap the chorizo for chicken and add a teaspoon of curry paste.',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    timeAgo: '5h ago',
    category: 'Lifestyle',
    articleUrl: 'https://www.bbcgoodfood.com/recipes/speedy-chorizo-chickpeas',
    reporters: [
      {
        id: 'rep-4a',
        name: 'Luca M.',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80',
        quote: 'Ten minutes and dinner is done',
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
  description: campaign.description,
  imageUrl: campaign.imageUrl,
  cta: campaign.cta,
  landingUrl: campaign.landingUrl,
  sponsored: true,
}));

export function findAdPostByLandingUrl(landingUrl: string): AdPost | undefined {
  return adItems.find((item) => item.landingUrl === landingUrl);
}

/** Static feed slots — disguised dating profiles are injected in buildDisguiseFeed(). */
export const disguiseFeedItems: FeedItem[] = [
  newsItems[0],
  adItems[0],
  newsItems[1],
  adItems[1],
  newsItems[2],
  adItems[2],
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
    text: 'BBC News: Tech giants AI spending story trending',
    time: '6h ago',
    articleUrl: 'https://www.bbc.co.uk/news/articles/c5yp2y8rdpro',
  },
  {
    id: 'a5',
    icon: 'megaphone-outline',
    text: 'Spotify Premium: 3 months free offer',
    time: '1d ago',
    landingUrl: 'https://www.spotify.com/premium/',
  },
];
