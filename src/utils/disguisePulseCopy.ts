import { Profile } from '../types/profile';

function cityLabel(profile: Profile): string {
  const city = profile.city?.trim();
  if (!city) {
    return 'the city';
  }
  return city.split(',')[0]?.trim() || city;
}

function firstInterest(profile: Profile): string {
  const interest = profile.interests.find((item) => item.trim().length > 0);
  return interest?.toLowerCase() ?? 'weekend plans';
}

function jobSnippet(profile: Profile): string {
  const job = profile.job?.trim();
  if (!job) {
    return 'Locals';
  }
  const words = job.split(/\s+/).slice(0, 3).join(' ');
  return words.length > 0 ? words : 'Locals';
}

/** Pulse news-card headline tied to the woven profile — not a shared BBC template. */
export function pulseNewsHeadlineForProfile(profile: Profile, slotIndex: number): string {
  const city = cityLabel(profile);
  const interest = firstInterest(profile);
  const templates = [
    `${jobSnippet(profile)} in ${city} share their go-to ${interest} spots`,
    `How ${city} regulars are rethinking ${interest} this season`,
    `${profile.name.split(' ')[0]} and neighbors weigh in on ${interest} in ${city}`,
    `Weekend guide: ${interest}, coffee, and hidden corners of ${city}`,
  ];
  return templates[slotIndex % templates.length];
}

export function pulseNewsSummaryForProfile(profile: Profile, slotIndex: number): string {
  const bio = profile.bio?.trim();
  if (bio && bio.length >= 48) {
    const sentence = bio.split(/(?<=[.!?])\s+/)[0]?.trim();
    if (sentence && sentence.length >= 32) {
      return sentence;
    }
  }
  const prompt = profile.prompts?.[0]?.answer?.trim();
  if (prompt) {
    return prompt;
  }
  const city = cityLabel(profile);
  const lines = [
    `Readers asked locals about ${firstInterest(profile)} — here is what stood out around ${city}.`,
    `A quick community thread on ${firstInterest(profile)} turned into the most saved post this week.`,
    `Comments stayed thoughtful: people swapped real recommendations instead of generic lists.`,
  ];
  return lines[slotIndex % lines.length];
}

export function pulseReporterQuoteForProfile(profile: Profile): string {
  const opening = profile.openingMove?.trim();
  if (opening) {
    return opening;
  }
  const prompt = profile.prompts?.[0]?.answer?.trim();
  if (prompt) {
    return prompt.length > 90 ? `${prompt.slice(0, 87).trimEnd()}…` : prompt;
  }
  const bio = profile.bio?.trim();
  if (bio) {
    return bio.length > 90 ? `${bio.slice(0, 87).trimEnd()}…` : bio;
  }
  return 'Worth a read if you are new to the neighborhood.';
}
