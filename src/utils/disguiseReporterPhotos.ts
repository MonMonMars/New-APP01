import { DisguiseAlertPerson, NewsReporter, SocialPost } from '../data/disguiseFeed';
import { disguiseSocialPosts } from '../data/disguiseSocialPosts';
import { SparkSection } from '../types/preferences';
import { Profile } from '../types/profile';
import { profileIntroCaption } from './profileIntroCaption';
import { resolveDisguiseProfile } from './resolveDisguiseProfile';

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
export function buildSocialReporter(
  post: SocialPost,
  section?: SparkSection | string | null,
): NewsReporter {
  const linkedProfile = resolveDisguiseProfile(`social-${post.id}`, undefined, section);
  const feedPhotos = post.imageUrl ? [post.imageUrl] : [];

  return {
    id: `social-${post.id}`,
    name: post.author,
    avatarUrl: post.avatarUrl,
    quote: linkedProfile ? profileIntroCaption(linkedProfile) : post.body,
    photos: feedPhotos,
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
  const linkedProfile = resolveDisguiseProfile(reporter.id, reporter.profileId, section);
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

/** Build a mini-window reporter for activity alerts — links to a dating profile when possible. */
export function buildAlertReporter(
  person: DisguiseAlertPerson,
  section?: SparkSection | string | null,
): NewsReporter {
  const social = findSocialPostForAlertPerson(person);
  if (social) {
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
