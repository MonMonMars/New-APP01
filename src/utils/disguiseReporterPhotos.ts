import { NewsReporter, SocialPost } from '../data/disguiseFeed';
import { Profile } from '../types/profile';
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
export function buildSocialReporter(post: SocialPost): NewsReporter {
  const linkedProfile = resolveDisguiseProfile(`social-${post.id}`);
  const feedPhotos = post.imageUrl ? [post.imageUrl] : [];

  return {
    id: `social-${post.id}`,
    name: post.author,
    avatarUrl: post.avatarUrl,
    quote: post.body,
    photos: feedPhotos,
    profileId: linkedProfile?.id,
  };
}

export function socialReporterPhotoIndex(reporter: NewsReporter, targetUrl?: string | null): number {
  if (!targetUrl?.trim()) {
    return 0;
  }
  const linkedProfile = resolveDisguiseProfile(reporter.id, reporter.profileId);
  const urls = buildReporterPhotoUrls(reporter, linkedProfile);
  const index = urls.indexOf(targetUrl.trim());
  return index >= 0 ? index : 0;
}
