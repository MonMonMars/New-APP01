import { Profile, UserProfile } from '../types/profile';

export const OPENING_MOVE_SUGGESTIONS = [
  "What's your go-to weekend plan?",
  'Best hidden gem in the city?',
  'Coffee or cocktails first date?',
  'Two truths and a lie?',
  "Best meal you've had lately?",
  'What are you passionate about right now?',
  'Window seat or aisle seat — settle this for me.',
  'Team early morning or late-night adventures?',
  'What is a green flag you look for?',
  'Describe your perfect lazy Sunday.',
  'Last song that got stuck in your head?',
  'Sweet or savory brunch person?',
] as const;

export function pickOpeningMove(profile: Profile): string {
  if (profile.openingMove?.trim()) {
    return profile.openingMove.trim();
  }
  if (profile.prompts && profile.prompts.length > 0) {
    const prompt = profile.prompts[0];
    return `Try: "${prompt.answer}"`;
  }
  const index = Number.parseInt(profile.id, 10) % OPENING_MOVE_SUGGESTIONS.length;
  return OPENING_MOVE_SUGGESTIONS[index];
}

export function getIcebreakerSuggestions(
  profile: Profile,
  user?: Pick<UserProfile, 'openingMove'>,
): string[] {
  const suggestions: string[] = [];

  if (user?.openingMove?.trim()) {
    suggestions.push(user.openingMove.trim());
  }

  const matchMove = pickOpeningMove(profile);
  if (!suggestions.includes(matchMove)) {
    suggestions.push(matchMove);
  }

  for (const suggestion of OPENING_MOVE_SUGGESTIONS) {
    if (suggestions.length >= 3) {
      break;
    }
    if (!suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }

  return suggestions.slice(0, 3);
}
