import { FeedItem } from '../data/disguiseFeed';
import { getProfileById } from '../data/profiles';
import { DisguiseAdCreative } from '../types/disguise';
import { AppLocale } from '../types/locale';
import { SparkSection } from '../types/preferences';
import { UserProfile } from '../types/profile';
import { disguiseFeedItemsForGender } from './disguiseFeedCatalog';
import { buildDisguisedProfileFeedItem, buildDisguisedProfileFeedItems } from './disguiseProfileFeed';
import { profileIntroCaption } from './profileIntroCaption';
import {
  renewPulseFeedPage,
} from './refreshPulseFeed';
import { mergeLiveNewsIntoFeed, densifyPulseNewsBlocks } from './mergeLivePulseNews';
import { socialAuthorDemoProfileId } from '../data/disguiseReporterProfileLinks';
import { explicitReporterProfileId } from './resolveDisguiseProfile';
import { getPulseLiveNewsSnapshot } from '../services/pulseLiveNews';

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

/** Drop woven profile ids so a Pulse refresh can reassign every slot. */
export function stripPulseProfileLinks(items: FeedItem[]): FeedItem[] {
  return items.map((item) => {
    if (item.type === 'news') {
      return {
        ...item,
        reporters: item.reporters.map((reporter) => ({
          ...reporter,
          profileId: undefined,
        })),
      };
    }

    if (item.type === 'disguised_profile' && item.id !== 'disguised-user') {
      return {
        ...item,
        profileId: undefined,
      };
    }

    return item;
  });
}

/** Pin reporter profile ids so news links do not swap after mini-window likes. */
export function pinFeedProfileLinks(items: FeedItem[], section?: SparkSection | string | null): FeedItem[] {
  return items.map((item) => {
    if (item.type !== 'news') {
      return item;
    }
    return {
      ...item,
      reporters: item.reporters.map((reporter) => ({
        ...reporter,
        profileId: explicitReporterProfileId(reporter.id, reporter.profileId),
      })),
    };
  });
}

/** Social avatars use the same Pexels identity as the linked discover profile. */
export function syncSocialPostProfiles(items: FeedItem[]): FeedItem[] {
  return items.map((item) => {
    if (item.type !== 'social') {
      return item;
    }
    const profileId = item.datingProfileId ?? socialAuthorDemoProfileId(item.author);
    if (!profileId) {
      return item;
    }
    const profile = getProfileById(profileId);
    if (!profile || profile.photos.length === 0) {
      return { ...item, datingProfileId: profileId };
    }
    return {
      ...item,
      datingProfileId: profileId,
      avatarUrl: profile.photos[0],
    };
  });
}

/** Use linked dating profile photos so Pulse reporters match their mini-window identity. */
export function syncReporterPhotos(items: FeedItem[], section?: SparkSection | string | null): FeedItem[] {
  return items.map((item) => {
    if (item.type !== 'news') {
      return item;
    }
    return {
      ...item,
      reporters: item.reporters.map((reporter) => {
        const profileId = explicitReporterProfileId(reporter.id, reporter.profileId);
        if (!profileId) {
          return reporter;
        }
        const profile = getProfileById(profileId);
        if (!profile || profile.photos.length === 0) {
          return { ...reporter, profileId };
        }
        const intro = profileIntroCaption(profile);
        return {
          ...reporter,
          profileId,
          avatarUrl: profile.photos[0],
          photos: profile.photos,
          quote: intro || reporter.quote,
        };
      }),
    };
  });
}

export function buildDisguiseFeed(
  user: UserProfile,
  creative: DisguiseAdCreative | null,
  section?: SparkSection | string | null,
  refreshGeneration = 0,
  locale?: AppLocale | null,
): FeedItem[] {
  const profileCards = buildDisguisedProfileFeedItems(section, refreshGeneration);
  let baseFeed = disguiseFeedItemsForGender(user.gender);

  const liveSnapshot = getPulseLiveNewsSnapshot();
  const livePosts = liveSnapshot?.posts ?? [];
  if (livePosts.length > 0) {
    baseFeed = mergeLiveNewsIntoFeed(baseFeed, livePosts, refreshGeneration);
    baseFeed = densifyPulseNewsBlocks(baseFeed, livePosts, refreshGeneration);
  }

  const withProfiles = weaveProfileCards(baseFeed, profileCards);

  let linked = syncSocialPostProfiles(
    syncReporterPhotos(pinFeedProfileLinks(withProfiles, section), section),
  );

  if (creative) {
    const userItem = buildDisguisedProfileFeedItem(user, creative);
    const withoutUserSlot = linked.filter((item) => item.id !== 'disguised-user');
    linked = syncSocialPostProfiles(
      syncReporterPhotos(
        pinFeedProfileLinks(
          [withoutUserSlot[0], withoutUserSlot[1], userItem, ...withoutUserSlot.slice(2)],
          section,
        ),
        section,
      ),
    );
  }

  if (refreshGeneration > 0) {
    return renewPulseFeedPage(linked, section, refreshGeneration);
  }

  return linked;
}
