import { Profile, UserProfile } from '../types/profile';

/** Hinge-style compatibility score from shared signals (demo heuristic). */
export function computeCompatibilityScore(user: UserProfile, profile: Profile): number {
  let score = 58;
  const userInterests = new Set(user.interests.map((i) => i.toLowerCase()));
  const shared = profile.interests.filter((i) => userInterests.has(i.toLowerCase()));
  score += Math.min(shared.length * 7, 21);

  if (profile.prompts && profile.prompts.length >= 2) {
    score += 6;
  }
  if (profile.bio.trim().length > 30) {
    score += 4;
  }
  const isVerified =
    (profile.photoVerified === true && profile.personVerified === true) ||
    profile.verified === true;
  if (isVerified) {
    score += 3;
  }
  if (profile.hasVideo) {
    score += 2;
  }

  const ageDiff = Math.abs(user.age - profile.age);
  if (ageDiff <= 2) {
    score += 7;
  } else if (ageDiff <= 5) {
    score += 3;
  }

  if (profile.distanceMiles <= 5) {
    score += 4;
  } else if (profile.distanceMiles <= 15) {
    score += 2;
  }

  return Math.min(99, Math.max(64, score));
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Deterministic daily Most Compatible pick (Hinge-inspired). */
export function pickDailyMostCompatible(
  user: UserProfile,
  profiles: Profile[],
  dateKey: string,
): Profile | null {
  const eligible = profiles.filter((p) => p.prompts && p.prompts.length > 0);
  if (eligible.length === 0) {
    return null;
  }
  const ranked = [...eligible].sort(
    (a, b) => computeCompatibilityScore(user, b) - computeCompatibilityScore(user, a),
  );
  const index = hashString(`${dateKey}:${user.name}`) % Math.min(5, ranked.length);
  return ranked[index] ?? ranked[0];
}
