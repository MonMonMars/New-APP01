import { disguiseClientAds } from '../data/disguiseClientAds';
import {
  disguiseFemaleNewsItems,
} from '../data/disguiseFemaleFeed';
import {
  femaleBreakingNowCards,
  femaleEditorsPicks,
  femalePulseBrief,
} from '../data/disguiseFemaleTrending';
import { breakingNowCards, editorsPicks, pulseBrief } from '../data/disguiseTrending';
import { disguiseNewsExtra } from '../data/disguiseNewsExtra';
import { disguiseSocialPosts } from '../data/disguiseSocialPosts';
import { disguiseFeedItems, FeedItem, NewsPost } from '../data/disguiseFeed';
import {
  briefToNewsPost,
  breakingToNewsPost,
  editorsPickToNewsPost,
} from './disguiseTrendingArticles';

const catalogById = new Map<string, FeedItem>();

function registerItem(item: FeedItem) {
  if (!catalogById.has(item.id)) {
    catalogById.set(item.id, item);
  }
}

for (const item of disguiseFeedItems) {
  registerItem(item);
}
for (const item of disguiseSocialPosts) {
  registerItem(item);
}
for (const item of disguiseClientAds.map((campaign) => ({
  id: campaign.id,
  type: 'ad' as const,
  brand: campaign.brand,
  tagline: campaign.tagline,
  description: campaign.description,
  imageUrl: campaign.imageUrl,
  cta: campaign.cta,
  landingUrl: campaign.landingUrl,
  sponsored: true as const,
}))) {
  registerItem(item);
}
for (const item of disguiseNewsExtra) {
  registerItem(item);
}
registerItem(briefToNewsPost(pulseBrief));
for (const card of breakingNowCards) {
  registerItem(breakingToNewsPost(card));
}
for (const pick of editorsPicks) {
  registerItem(editorsPickToNewsPost(pick));
}
for (const item of disguiseFemaleNewsItems) {
  registerItem(item);
}
registerItem(briefToNewsPost(femalePulseBrief));
for (const card of femaleBreakingNowCards) {
  registerItem(breakingToNewsPost(card));
}
for (const pick of femaleEditorsPicks) {
  registerItem(editorsPickToNewsPost(pick));
}

/** Look up a static feed item by id (news, social, ad). */
export function findFeedItemById(id: string): FeedItem | undefined {
  return catalogById.get(id);
}

/** Resolve a news headline from reading history back to a catalog article when possible. */
export function findNewsPostByHeadline(headline: string): NewsPost | undefined {
  for (const item of catalogById.values()) {
    if (item.type === 'news' && item.headline === headline) {
      return item;
    }
  }
  return undefined;
}
