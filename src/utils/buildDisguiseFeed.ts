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
  freshenPulseFeedTimestamps,
  renewPulseFeedProfiles,
  rotatePulseList,
} from './refreshPulseFeed';
import { explicitReporterProfileId } from './resolveDisguiseProfile';

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
        profileId: explicitReporterProfileId(reporter),
      })),
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
        const profileId = explicitReporterProfileId(reporter);
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
  if (refreshGeneration > 0) {
    baseFeed = freshenPulseFeedTimestamps(
      rotatePulseList(baseFeed, refreshGeneration),
      refreshGeneration,
      locale,
    );
  }
  const withProfiles = weaveProfileCards(baseFeed, profileCards);

  let linked = syncReporterPhotos(pinFeedProfileLinks(withProfiles, section), section);

  if (creative) {
    const userItem = buildDisguisedProfileFeedItem(user, creative);
    const withoutUserSlot = linked.filter((item) => item.id !== 'disguised-user');
    linked = syncReporterPhotos(
      pinFeedProfileLinks(
        [withoutUserSlot[0], withoutUserSlot[1], userItem, ...withoutUserSlot.slice(2)],
        section,
      ),
      section,
    );
  }

  if (refreshGeneration > 0) {
    return renewPulseFeedProfiles(linked, section, refreshGeneration);
  }

  return linked;
}
