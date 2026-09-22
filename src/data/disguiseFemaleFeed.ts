import { disguiseClientAds } from './disguiseClientAds';
import { disguiseSocialPosts } from './disguiseSocialPosts';
import { FeedItem, NewsPost } from './disguiseFeed';
import { freeNewsLinks, pulseNewsImages } from './pulseNewsMedia';
import { interleaveUniquePulseFeed } from '../utils/pulseFeedUnique';

const femaleNewsItems: NewsPost[] = [
  {
    id: 'fnews-1',
    type: 'news',
    source: 'Pulse Cosmos',
    headline: 'Virgo weekly: slow down before you over-commit this weekend',
    summary:
      'Mercury eases out of retrograde shadow — a good week to finish one project before saying yes to three more.',
    articleBody:
      'This week favors editing over launching for Virgo and fellow earth signs.\n\nThe moon moves through your communication zone mid-week, so a candid text lands better than a long voice note.\n\nTarot tie-in: The Hermit reversed — rest is productive, not lazy.',
    imageUrl: pulseNewsImages.stars,
    timeAgo: '8m ago',
    category: '星座',
    articleUrl: freeNewsLinks.bbcCulture,
    reporters: [],
  },
  {
    id: 'fnews-2',
    type: 'news',
    source: 'Pulse Tarot',
    headline: 'Card of the day: The Star — renewal after a quiet chapter',
    summary:
      'A gentle reset is available if you stop replaying the last conversation in your head.',
    articleBody:
      'The Star points to hope without hype — small rituals, water, sleep, and one honest boundary.\n\nIf you pulled this card for love, someone steady may resurface as a message, not a grand gesture.\n\nJournal prompt: What would feel peaceful by Sunday night?',
    imageUrl: pulseNewsImages.tarot,
    timeAgo: '22m ago',
    category: 'Tarot',
    articleUrl: freeNewsLinks.guardianStage,
    reporters: [],
  },
  {
    id: 'fnews-3',
    type: 'news',
    source: 'BBC Culture',
    headline: 'Summer festival previews: the line-ups worth bookmarking now',
    summary:
      'From indie pop weekends to city park concerts — our editors picked the free streams and early-bird tickets.',
    articleBody:
      'Festival season is stacking up fast. BBC Culture rounded up the best-value weekends for music and food lovers.\n\nSeveral cities are adding late-night transit again, making weeknight shows easier to catch.\n\nPulse tip: save the article offline before you lose signal at the venue.',
    imageUrl: pulseNewsImages.concert,
    timeAgo: '1h ago',
    category: 'Entertainment',
    articleUrl: freeNewsLinks.bbcCulture,
    reporters: [],
  },
  {
    id: 'fnews-4',
    type: 'news',
    source: 'The Guardian',
    headline: 'Five films streaming this week that are actually worth the runtime',
    summary:
      'Rom-coms, quiet dramas, and one documentary everyone will pretend they saw in theaters.',
    articleBody:
      'Guardian film desk highlights five titles you can finish in one evening — no trilogy commitment required.\n\nCritics note stronger roles for women leads this quarter across streaming platforms.\n\nPair with popcorn, not your ex\'s Instagram.',
    imageUrl: pulseNewsImages.cinema,
    timeAgo: '2h ago',
    category: 'Entertainment',
    articleUrl: freeNewsLinks.guardianFilm,
    reporters: [],
  },
  {
    id: 'fnews-5',
    type: 'news',
    source: 'Pulse Cosmos',
    headline: 'Libra moon tonight: conversations flow, but read the fine print',
    summary:
      'Social energy is high — great for dates, tricky for group chats after midnight.',
    articleBody:
      'Libra moon highlights balance in relationships. Air signs feel chatty; water signs may need a breather.\n\nCompatibility note: fire signs bring momentum, earth signs bring plans.\n\nTarot tie-in: Two of Cups — mutual interest, not a contract.',
    imageUrl: pulseNewsImages.moon,
    timeAgo: '3h ago',
    category: '星座',
    articleUrl: freeNewsLinks.nprPopCulture,
    reporters: [],
  },
  {
    id: 'fnews-6',
    type: 'news',
    source: 'NPR',
    headline: 'Pop culture desk: albums, memes, and the one show everyone rewatched',
    summary:
      'A quick culture catch-up for the group chat — no spoilers, just the highlights.',
    articleBody:
      'NPR\'s pop culture team sums up the week in music drops, viral clips, and the comfort rewatch dominating lunch breaks.\n\nEntertainment writers say live comedy tickets are selling faster than arena tours in several cities.',
    imageUrl: pulseNewsImages.fashion,
    timeAgo: '4h ago',
    category: 'Entertainment',
    articleUrl: freeNewsLinks.nprPopCulture,
    reporters: [],
  },
  {
    id: 'fnews-7',
    type: 'news',
    source: 'Pulse Tarot',
    headline: 'Three-card spread for the weekend: past, present, possible',
    summary:
      'Past — Four of Pentacles. Present — Knight of Wands. Possible — Ace of Cups.',
    articleBody:
      'You may be holding onto a situation out of comfort, not joy.\n\nThe present card pushes for honest momentum — say what you want plainly.\n\nThe possible card is soft new energy: a match, an invite, or a creative yes.',
    imageUrl: pulseNewsImages.gallery,
    timeAgo: '5h ago',
    category: 'Tarot',
    articleUrl: freeNewsLinks.guardianFilm,
    reporters: [],
  },
  {
    id: 'fnews-8',
    type: 'news',
    source: 'BBC Culture',
    headline: 'Red carpet recap: the looks people will copy by Friday',
    summary:
      'Minimal jewelry, strong color blocks, and hair that survives humidity — stylists break down what worked.',
    articleBody:
      'BBC Culture\'s fashion team notes a shift toward wearable silhouettes after a season of extreme couture.\n\nBeauty editors highlight skin-first makeup that reads well on video dates and office calls alike.',
    imageUrl: pulseNewsImages.theater,
    timeAgo: '6h ago',
    category: 'Entertainment',
    articleUrl: freeNewsLinks.bbcCulture,
    reporters: [],
  },
];

const femaleAdItems = disguiseClientAds.map((campaign) => ({
  id: `f-${campaign.id}`,
  type: 'ad' as const,
  brand: campaign.brand,
  tagline: campaign.tagline,
  description: campaign.description,
  imageUrl: campaign.imageUrl,
  cta: campaign.cta,
  landingUrl: campaign.landingUrl,
  sponsored: true as const,
}));

/** Woman accounts see cosmos, tarot, and entertainment in Pulse disguise. */
export const disguiseFemaleFeedItems: FeedItem[] = interleaveUniquePulseFeed(
  femaleNewsItems,
  disguiseSocialPosts,
  femaleAdItems,
);

export const disguiseFemaleNewsItems = femaleNewsItems;

export function findFemaleNewsPostByArticleUrl(articleUrl: string): NewsPost | undefined {
  return femaleNewsItems.find((item) => item.articleUrl === articleUrl);
}
