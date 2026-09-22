import {
  femaleBreakingNowCards,
  femaleEditorsPicks,
  femalePulseBrief,
} from '../data/disguiseFemaleTrending';
import { breakingNowCards, editorsPicks, pulseBrief } from '../data/disguiseTrending';
import { FeedItem, NewsPost } from '../data/disguiseFeed';
import type { ProfileGender } from '../types/profile';
import { registerDisguiseCatalogItems } from './disguiseFeedCatalog';
import { usesFemalePulseExperience } from './genderAccountPerks';
import {
  briefToNewsPost,
  breakingToNewsPost,
  editorsPickToNewsPost,
} from './disguiseTrendingArticles';

type CatalogKey = 'female' | 'male';

function registerInto(map: Map<string, FeedItem>, item: FeedItem) {
  if (!map.has(item.id)) {
    map.set(item.id, item);
  }
}

function buildCatalogForGender(gender?: ProfileGender | null): Map<string, FeedItem> {
  const catalog = new Map<string, FeedItem>();

  for (const item of registerDisguiseCatalogItems(gender)) {
    registerInto(catalog, item);
  }

  if (usesFemalePulseExperience(gender)) {
    registerInto(catalog, briefToNewsPost(femalePulseBrief));
    for (const card of femaleBreakingNowCards) {
      registerInto(catalog, breakingToNewsPost(card));
    }
    for (const pick of femaleEditorsPicks) {
      registerInto(catalog, editorsPickToNewsPost(pick));
    }
  } else {
    registerInto(catalog, briefToNewsPost(pulseBrief));
    for (const card of breakingNowCards) {
      registerInto(catalog, breakingToNewsPost(card));
    }
    for (const pick of editorsPicks) {
      registerInto(catalog, editorsPickToNewsPost(pick));
    }
  }

  return catalog;
}

const catalogCache = new Map<CatalogKey, Map<string, FeedItem>>();

function catalogKeyForGender(gender?: ProfileGender | null): CatalogKey {
  return usesFemalePulseExperience(gender) ? 'female' : 'male';
}

function catalogForGender(gender?: ProfileGender | null): Map<string, FeedItem> {
  const key = catalogKeyForGender(gender);
  let catalog = catalogCache.get(key);
  if (!catalog) {
    catalog = buildCatalogForGender(gender);
    catalogCache.set(key, catalog);
  }
  return catalog;
}

/** Look up a static feed item by id (news, social, ad) scoped to the account gender. */
export function findFeedItemById(id: string, gender?: ProfileGender | null): FeedItem | undefined {
  return catalogForGender(gender).get(id);
}

/** Resolve a news headline from reading history back to a catalog article when possible. */
export function findNewsPostByHeadline(
  headline: string,
  gender?: ProfileGender | null,
): NewsPost | undefined {
  for (const item of catalogForGender(gender).values()) {
    if (item.type === 'news' && item.headline === headline) {
      return item;
    }
  }
  return undefined;
}
