import { disguiseFeedItems, FeedItem, SocialPost } from '../data/disguiseFeed';
import { DisguiseAdCreative } from '../types/disguise';
import { UserProfile } from '../types/profile';

function buildUserSocialPost(user: UserProfile, creative: DisguiseAdCreative): SocialPost {
  const handle = `@${user.name.toLowerCase().replace(/\s+/g, '')}`;
  const useOverlay = creative.useOverlay ?? false;

  return {
    id: 'social-user',
    type: 'social',
    author: user.name,
    handle,
    avatarUrl: creative.imageUrl,
    maskAvatar: useOverlay,
    avatarMask: useOverlay
      ? { variant: creative.variant, text: creative.overlayText }
      : undefined,
    body:
      creative.variant === 'ad'
        ? 'Saw this deal in my feed — sharing before it expires.'
        : 'This headline caught my eye this morning. Wild times.',
    imageUrl: creative.imageUrl,
    imageMask: useOverlay ? { variant: creative.variant, text: creative.overlayText } : undefined,
    likes: 42,
    comments: 7,
    timeAgo: 'Just now',
  };
}

export function buildDisguiseFeed(
  user: UserProfile,
  creative: DisguiseAdCreative | null,
): FeedItem[] {
  if (!creative) {
    return disguiseFeedItems;
  }

  const userPost = buildUserSocialPost(user, creative);
  const withoutUserSlot = disguiseFeedItems.filter((item) => item.id !== 'social-user');

  return [withoutUserSlot[0], withoutUserSlot[1], userPost, ...withoutUserSlot.slice(2)];
}
