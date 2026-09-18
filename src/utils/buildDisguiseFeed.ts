import { FeedItem } from '../data/disguiseFeed';
import { DisguiseAdCreative } from '../types/disguise';
import { SparkSection } from '../types/preferences';
import { UserProfile } from '../types/profile';
import { disguiseFeedItemsForGender } from './disguiseFeedCatalog';
import { buildDisguisedProfileFeedItem, buildDisguisedProfileFeedItems } from './disguiseProfileFeed';
import { pinnedReporterProfileId, resolveDisguiseProfileId } from './resolveDisguiseProfile';

function weaveProfileCards(base: FeedItem[], profileCards: FeedItem[]): FeedItem[] {
  if (profileCards.length === 0) {
    return base;
  }

  const result: FeedItem[] = [];
  let profileIndex = 0;

  base.forEach((item, index) => {
    result.push(item);
    if ((index + 1) % 2 === 0 && profileIndex < profileCards.length) {
      result.push(profileCards[profileIndex]);
      profileIndex += 1;
    }
  });

  while (profileIndex < profileCards.length) {
    result.push(profileCards[profileIndex]);
    profileIndex += 1;
  }

  return result;
}

/** Pin reporter profile ids so news links do not swap after mini-window likes. */
function pinFeedProfileLinks(items: FeedItem[], section?: SparkSection | string | null): FeedItem[] {
  return items.map((item) => {
    if (item.type !== 'news') {
      return item;
    }
    return {
      ...item,
      reporters: item.reporters.map((reporter) => ({
        ...reporter,
        profileId:
          reporter.profileId ??
          resolveDisguiseProfileId(reporter.id) ??
          pinnedReporterProfileId(reporter.id, section),
      })),
    };
  });
}

export function buildDisguiseFeed(
  user: UserProfile,
  creative: DisguiseAdCreative | null,
  section?: SparkSection | string | null,
): FeedItem[] {
  const profileCards = buildDisguisedProfileFeedItems(section);
  const baseFeed = disguiseFeedItemsForGender(user.gender);
  const withProfiles = weaveProfileCards(baseFeed, profileCards);

  const linked = pinFeedProfileLinks(withProfiles, section);

  if (!creative) {
    return linked;
  }

  const userItem = buildDisguisedProfileFeedItem(user, creative);
  const withoutUserSlot = linked.filter((item) => item.id !== 'disguised-user');

  return pinFeedProfileLinks(
    [withoutUserSlot[0], withoutUserSlot[1], userItem, ...withoutUserSlot.slice(2)],
    section,
  );
}
