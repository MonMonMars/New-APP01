import { disguiseFeedItems, FeedItem } from '../data/disguiseFeed';
import { DisguiseAdCreative } from '../types/disguise';
import { SparkSection } from '../types/preferences';
import { UserProfile } from '../types/profile';
import { buildDisguisedProfileFeedItem, buildDisguisedProfileFeedItems } from './disguiseProfileFeed';

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

export function buildDisguiseFeed(
  user: UserProfile,
  creative: DisguiseAdCreative | null,
  section?: SparkSection | string | null,
): FeedItem[] {
  const profileCards = buildDisguisedProfileFeedItems(section);
  const withProfiles = weaveProfileCards(disguiseFeedItems, profileCards);

  if (!creative) {
    return withProfiles;
  }

  const userItem = buildDisguisedProfileFeedItem(user, creative);
  const withoutUserSlot = withProfiles.filter((item) => item.id !== 'disguised-user');

  return [withoutUserSlot[0], withoutUserSlot[1], userItem, ...withoutUserSlot.slice(2)];
}
