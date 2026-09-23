import { FeedItem } from '../data/disguiseFeed';
import { getProfileById } from '../data/profiles';
import { DisguiseAdCreative } from '../types/disguise';
import { AppLocale } from '../types/locale';
import { resolveSparkSection, ShowMePreference, SparkSection } from '../types/preferences';
import { PulseWorldPoolScope } from './pulseWorldPool';
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
import { explicitReporterProfileId } from './resolveDisguiseProfile';
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

function filterPulseFeedForShowMe(items: FeedItem[], showMe: ShowMePreference): FeedItem[] {
  if (showMe === 'everyone') {
    return items;
  }
  return items.filter((item) => {
    if (item.type !== 'social') {
      return true;
    }
    const profileId = item.datingProfileId ?? socialAuthorDemoProfileId(item.author);
    if (!profileId) {
      return true;
    }
    const profile = getProfileById(profileId);
    return profile ? matchesShowMePreference(profile, showMe) : true;
  });
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
function scopeForSection(
  section: SparkSection | string | null | undefined,
  poolScope?: PulseWorldPoolScope,
): PulseWorldPoolScope {
  return (
    poolScope ?? {
      sparkSection: resolveSparkSection(section),
      pulseDisplaySpark: true,
      pulseDisplayEmber: false,
    }
  );
}

export function pinFeedProfileLinks(
  items: FeedItem[],
  section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
  poolScope?: PulseWorldPoolScope,
): FeedItem[] {
  const scope = scopeForSection(section, poolScope);
  return items.map((item) => {
    if (item.type !== 'news') {
      return item;
    }
    return {
      ...item,
      reporters: item.reporters.map((reporter) => ({
        ...reporter,
        profileId: explicitReporterProfileId(reporter.id, reporter.profileId, showMe, section, scope),
      })),
    };
  });
}

/** Social avatars mirror the linked discover profile photo set. */
export function syncSocialPostProfiles(
  items: FeedItem[],
  _section?: SparkSection | string | null,
  showMe: ShowMePreference = 'everyone',
): FeedItem[] {
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
    if (showMe !== 'everyone' && !matchesShowMePreference(profile, showMe)) {
      return item;
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
  poolScope?: PulseWorldPoolScope,
): FeedItem[] {
  const scope = scopeForSection(section, poolScope);
  return items.map((item) => {
    if (item.type !== 'news') {
      return item;
    }
    return {
      ...item,
      reporters: item.reporters.map((reporter) => {
        const profileId = explicitReporterProfileId(reporter.id, reporter.profileId, showMe, section, scope);
        if (!profileId) {
          return reporter;
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
          avatarUrl: profile.photos[0],
          photos: profile.photos,
          quote: intro || quote || reporter.quote,
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
  showMe: ShowMePreference = 'everyone',
  poolScope?: PulseWorldPoolScope,
): FeedItem[] {
  const scope = scopeForSection(section, poolScope);
  const profileCards = buildDisguisedProfileFeedItems(section, refreshGeneration, showMe, scope);
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
      syncReporterPhotos(pinFeedProfileLinks(withProfiles, section, showMe, scope), section, showMe, scope),
      section,
      showMe,
    ),
    showMe,
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
            scope,
          ),
          section,
          showMe,
          scope,
        ),
        section,
        showMe,
      ),
      showMe,
    );
  }

  const spaced = dedupePulseFeedItems(spaceSponsoredFeedItems(linked, 6));

  if (refreshGeneration > 0) {
    return dedupePulseFeedItems(renewPulseFeedPage(spaced, section, refreshGeneration, showMe, scope));
  }

  return spaced;
}
