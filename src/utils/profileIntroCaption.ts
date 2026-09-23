import { getProfileById } from '../data/profiles';
import { Profile } from '../types/profile';

const MAX_CAPTION_LENGTH = 140;

/** Caption beside a Pulse thumbnail from a woven profile id (feed item source of truth). */
export function pulseFeedCaptionForProfileId(profileId: string | undefined): string {
  if (!profileId) {
    return '';
  }
  const profile = getProfileById(profileId);
  return profile ? profileIntroCaption(profile) : '';
}

/** Dating-profile intro line for Pulse feed captions beside profile thumbs. */
export function profileIntroCaption(profile: Profile): string {
  const bio = profile.bio?.trim();
  if (bio) {
    return truncateIntro(bio);
  }

  const openingMove = profile.openingMove?.trim();
  if (openingMove) {
    return truncateIntro(openingMove);
  }

  const promptAnswer = profile.prompts?.[0]?.answer?.trim();
  if (promptAnswer) {
    return truncateIntro(promptAnswer);
  }

  return '';
}

function truncateIntro(text: string): string {
  if (text.length <= MAX_CAPTION_LENGTH) {
    return text;
  }

  const slice = text.slice(0, MAX_CAPTION_LENGTH);
  const lastSpace = slice.lastIndexOf(' ');
  const trimmed = lastSpace > 80 ? slice.slice(0, lastSpace) : slice;
  return `${trimmed.trimEnd()}…`;
}
