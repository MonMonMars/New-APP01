import { disguiseFeedItems, FeedItem } from '../data/disguiseFeed';
import { DisguiseAdCreative } from '../types/disguise';
import { UserProfile } from '../types/profile';
import { buildDisguisedProfileFeedItem } from './disguiseProfileFeed';

export function buildDisguiseFeed(
  user: UserProfile,
  creative: DisguiseAdCreative | null,
): FeedItem[] {
  if (!creative) {
    return disguiseFeedItems;
  }

  const userItem = buildDisguisedProfileFeedItem(user, creative);
  const withoutUserSlot = disguiseFeedItems.filter((item) => item.id !== 'disguised-user');

  return [withoutUserSlot[0], withoutUserSlot[1], userItem, ...withoutUserSlot.slice(2)];
}
