import { FeedItem } from '../data/disguiseFeed';
import { getProfileById } from '../data/profiles';
import { DisguiseAdCreative } from '../types/disguise';
import { AppLocale } from '../types/locale';
import { ShowMePreference, SparkSection } from '../types/preferences';
import { UserProfile } from '../types/profile';
import { disguiseFeedItemsForGender } from './disguiseFeedCatalog';
import { buildDisguisedProfileFeedItem, buildDisguisedProfileFeedItems } from './disguiseProfileFeed';
import { pulseReporterQuoteForProfile } from './disguisePulseCopy';
import { profileIntroCaption } from './profileIntroCaption';
import {
  renewPulseFeedPage,
} from './refreshPulseFeed';
import { mergeLiveNewsIntoFeed } from './mergeLivePulseNews';
import { socialAuthorDemoProfileId } from '../data/disguiseReporterProfileLinks';
import {
  explicitReporterProfileId,
  profileIdFromPostId,
  pulseSocialPostReporterId,
} from './resolveDisguiseProfile';
import { disguiseDisplayName } from './disguiseProfileFeed';
import { getPulseLiveNewsSnapshot } from '../services/pulseLiveNews';
import { spaceSponsoredFeedItems } from './pulseFeedSpacing';
import { dedupePulseFeedItems } from './pulseFeedUnique';
import { matchesShowMePreference } from './showMeFilter';

function weaveProfileCards(base: FeedItem[], profileCards: FeedItem[]): FeedItem[] {
  if (profileCards.length === 0) {
    return base;
  }

  const result: FeedItem[] = [];
  let profileIndex = 0;

  base.forEach((item, index) => {
    result.push(item);
    if ((index + 1) % 5 === 0 && profileIndex < profileCards.length) {
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

function socialPostProfileId(
  item: Extract<FeedItem, { type: 'social' }>,
  showMe: ShowMePreference,
  section?: SparkSection | string | null,
): string | undefined {
  return explicitReporterProfileId(
    pulseSocialPostReporterId(item.id),
    item.datingProfileId ?? socialAuthorDemoProfileId(item.author),
    showMe,
    section,
  );
}

function feedItemMatchesShowMe(
  item: FeedItem,
  showMe: ShowMePreference,
  section?: SparkSection | string | null,
): boolean {
  if (showMe === 'everyone') {
    return true;
  }
  if (item.type === 'social') {
    const profileId = socialPostProfileId(item, showMe, section);
    if (!profileId) {
      return false;
    }
    const profile = getProfileById(profileId);
    return profile ? matchesShowMePreference(profile, showMe) : false;
  }
  if (item.type === 'disguised_profile') {
    if (item.id === 'disguised-user') {
      return true;
    }
    const profileId = explicitReporterProfileId(
      item.id,
      item.profileId ?? profileIdFromPostId(item.id),
      showMe,
      section,
    );
    if (!profileId) {
      return false;
    }
    const profile = getProfileById(profileId);
    return profile ? matchesShowMePreference(profile, showMe) : false;
  }
  return true;
}

function filterPulseFeedForShowMe(
  items: FeedItem[],
  showMe: ShowMePreference,
  section?: SparkSection | string | null,
): FeedItem[] {
  if (showMe === 'everyone') {
    return items;
  }
  return items.filter((item) => feedItemMatchesShowMe(item, showMe, section));
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
export function pinFeedProfileLinks(
  items: FeedItem[],
  section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
): FeedItem[] {
  return items.map((item) => {
    if (item.type === 'news') {
      return {
        ...item,
        reporters: item.reporters.map((reporter) => ({
          ...reporter,
          profileId: explicitReporterProfileId(reporter.id, reporter.profileId, showMe, section),
        })),
      };
    }
    if (item.type === 'disguised_profile' && item.id !== 'disguised-user') {
      return {
        ...item,
        profileId: explicitReporterProfileId(
          item.id,
          item.profileId ?? profileIdFromPostId(item.id),
          showMe,
          section,
        ),
      };
    }
    return item;
  });
}

/** Social avatars mirror the linked discover profile photo set. */
export function syncSocialPostProfiles(
  items: FeedItem[],
  section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
): FeedItem[] {
  return items.map((item) => {
    if (item.type !== 'social') {
      return item;
    }
    const profileId = socialPostProfileId(item, showMe, section);
    if (!profileId) {
      return { ...item, datingProfileId: undefined };
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
export function syncReporterPhotos(
  items: FeedItem[],
  section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
): FeedItem[] {
  return items.map((item) => {
    if (item.type !== 'news') {
      return item;
    }
    const reporters = item.reporters
      .map((reporter) => {
        const profileId = explicitReporterProfileId(reporter.id, reporter.profileId, showMe, section);
        if (!profileId) {
          return showMe === 'everyone' ? reporter : null;
        }
        const profile = getProfileById(profileId);
        if (!profile || profile.photos.length === 0) {
          return { ...reporter, profileId };
        }
        const intro = profileIntroCaption(profile);
        const quote = pulseReporterQuoteForProfile(profile);
        return {
          ...reporter,
          profileId,
          name: disguiseDisplayName(profile.name),
          avatarUrl: profile.photos[0],
          photos: profile.photos,
          quote: intro || quote || reporter.quote,
        };
      })
      .filter((reporter): reporter is NonNullable<typeof reporter> => reporter !== null);

    return {
      ...item,
      reporters,
    };
  });
}

export function buildDisguiseFeed(
  user: UserProfile,
  creative: DisguiseAdCreative | null,
  section?: SparkSection | string | null,
  refreshGeneration = 0,
  locale?: AppLocale | null,
  showMe: ShowMePreference = 'everyone',
): FeedItem[] {
  const profileCards = buildDisguisedProfileFeedItems(section, refreshGeneration, showMe);
  let baseFeed = disguiseFeedItemsForGender(user.gender);

  const liveSnapshot = getPulseLiveNewsSnapshot();
  const livePosts = liveSnapshot?.posts ?? [];
  if (livePosts.length > 0) {
    baseFeed = mergeLiveNewsIntoFeed(baseFeed, livePosts, refreshGeneration);
  }
  baseFeed = dedupePulseFeedItems(baseFeed);

  const withProfiles = weaveProfileCards(baseFeed, profileCards);

  let linked = filterPulseFeedForShowMe(
    syncSocialPostProfiles(
      syncReporterPhotos(pinFeedProfileLinks(withProfiles, section, showMe), section, showMe),
      section,
      showMe,
    ),
    showMe,
    section,
  );

  if (creative) {
    const userItem = buildDisguisedProfileFeedItem(user, creative);
    const withoutUserSlot = linked.filter((item) => item.id !== 'disguised-user');
    linked = filterPulseFeedForShowMe(
      syncSocialPostProfiles(
        syncReporterPhotos(
          pinFeedProfileLinks(
            [withoutUserSlot[0], withoutUserSlot[1], userItem, ...withoutUserSlot.slice(2)],
            section,
            showMe,
          ),
          section,
          showMe,
        ),
        section,
        showMe,
      ),
      showMe,
      section,
    );
  }

  const spaced = dedupePulseFeedItems(spaceSponsoredFeedItems(linked, 6));

  if (refreshGeneration > 0) {
    return dedupePulseFeedItems(renewPulseFeedPage(spaced, section, refreshGeneration, showMe));
  }

  return spaced;
}
