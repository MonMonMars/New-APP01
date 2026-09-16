import { NewsReporter } from '../data/disguiseFeed';
import { Profile } from '../types/profile';

/** Build a de-duplicated photo list for disguise mini-window previews. */
export function buildReporterPhotoUrls(
  reporter: NewsReporter,
  linkedProfile?: Profile | null,
): string[] {
  const urls: string[] = [];

  const add = (url?: string | null) => {
    const trimmed = url?.trim();
    if (trimmed && !urls.includes(trimmed)) {
      urls.push(trimmed);
    }
  };

  if (linkedProfile) {
    linkedProfile.photos.forEach(add);
  }
  reporter.photos.forEach(add);
  add(reporter.avatarUrl);

  return urls;
}
