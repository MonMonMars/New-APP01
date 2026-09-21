import { alertDemoProfileId } from '../data/disguiseAlertProfileLinks';
import { socialAuthorDemoProfileId } from '../data/disguiseReporterProfileLinks';
import { DisguiseAlertPerson, NewsReporter, SocialPost } from '../data/disguiseFeed';
import { disguiseSocialPosts } from '../data/disguiseSocialPosts';
import { SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { profileIntroCaption } from './profileIntroCaption';
import { resolveExplicitDatingProfile } from './resolveDisguiseProfile';

/** Build a de-duplicated photo list for disguise mini-window previews. */
export function buildReporterPhotoUrls(
  reporter: NewsReporter,
  linkedProfile?: Profile | null,
  priorityUrls: string[] = [],
): string[] {
  const urls: string[] = [];

  const add = (url?: string | null) => {
    const trimmed = url?.trim();
    if (trimmed && !urls.includes(trimmed)) {
      urls.push(trimmed);
    }
  };

  priorityUrls.forEach(add);
  if (linkedProfile) {
    linkedProfile.photos.forEach(add);
  }
  reporter.photos.forEach(add);
  add(reporter.avatarUrl);

  return urls;
}

/** Reporter + photo list for a social post (feed image always included when present). */
export function resolveSocialPostProfileId(post: SocialPost): string | undefined {
  return post.datingProfileId ?? socialAuthorDemoProfileId(post.author);
}

export function buildSocialReporter(
  post: SocialPost,
  section?: SparkSection | string | null,
): NewsReporter {
  const profileId = resolveSocialPostProfileId(post);
  const linkedProfile = resolveExplicitDatingProfile(profileId, section);
  const feedPhotos = post.imageUrl ? [post.imageUrl] : [];
  const avatarUrl = linkedProfile?.photos[0] ?? post.avatarUrl;

  return {
    id: `social-${post.id}`,
    name: linkedProfile?.name ?? post.author,
    avatarUrl,
    quote: linkedProfile ? profileIntroCaption(linkedProfile) : post.body,
    photos: linkedProfile ? [...linkedProfile.photos, ...feedPhotos] : feedPhotos,
    profileId: linkedProfile?.id,
  };
}

export function socialReporterPhotoIndex(
  reporter: NewsReporter,
  targetUrl?: string | null,
  section?: SparkSection | string | null,
): number {
  if (!targetUrl?.trim()) {
    return 0;
  }
  const linkedProfile = resolveExplicitDatingProfile(reporter.profileId, section);
  const urls = buildReporterPhotoUrls(reporter, linkedProfile);
  const index = urls.indexOf(targetUrl.trim());
  return index >= 0 ? index : 0;
}

/** Match an activity-alert persona to a seeded social post (by name or avatar). */
export function findSocialPostForAlertPerson(person: DisguiseAlertPerson): SocialPost | undefined {
  return disguiseSocialPosts.find(
    (post) => post.author === person.name || post.avatarUrl === person.avatarUrl,
  );
}

/** Resolve an explicit woven profile for an activity alert avatar (no hash assignment). */
export function resolveAlertPersonProfile(
  person: DisguiseAlertPerson,
  section?: SparkSection | string | null,
): Profile | null {
  const explicitId = person.datingProfileId ?? alertDemoProfileId(person.name);
  return resolveExplicitDatingProfile(explicitId, section);
}

/** Build a mini-window reporter for activity alerts — links to a dating profile when possible. */
export function buildAlertReporter(
  person: DisguiseAlertPerson,
  section?: SparkSection | string | null,
): NewsReporter {
  const linkedProfile = resolveAlertPersonProfile(person, section);
  if (linkedProfile) {
    const intro = profileIntroCaption(linkedProfile);
    return {
      id: `alert-profile-${linkedProfile.id}`,
      name: linkedProfile.name,
      avatarUrl: linkedProfile.photos[0] ?? person.avatarUrl,
      quote: intro,
      photos: linkedProfile.photos,
      profileId: linkedProfile.id,
    };
  }

  const social = findSocialPostForAlertPerson(person);
  if (social?.datingProfileId) {
    return buildSocialReporter(social, section);
  }

  return {
    id: `alert-${person.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: person.name,
    avatarUrl: person.avatarUrl,
    quote: '',
    photos: [],
  };
}
