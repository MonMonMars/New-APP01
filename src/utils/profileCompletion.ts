import { UserProfile, EMBER_PROMPT_OPTIONS } from '../types/profile';

export type ProfileTip = {
  id: string;
  label: string;
  done: boolean;
  suggestion?: string;
};

export function computeProfileCompletion(user: UserProfile): {
  score: number;
  tips: ProfileTip[];
} {
  const tips: ProfileTip[] = [
    {
      id: 'photos',
      label: 'Add 3+ photos',
      done: user.photos.length >= 3,
      suggestion: 'Profiles with 3+ photos get 2× more likes (Bumble research).',
    },
    {
      id: 'bio',
      label: 'Write a bio (40+ chars)',
      done: user.bio.trim().length >= 40,
      suggestion: 'Share a specific detail — a hobby, vibe, or what you are looking for.',
    },
    {
      id: 'prompts',
      label: 'Answer 2+ prompts',
      done: (user.prompts?.length ?? 0) >= 2,
      suggestion: 'Hinge daters with prompts get more meaningful conversations.',
    },
    {
      id: 'interests',
      label: 'Add 5+ interests',
      done: user.interests.length >= 5,
      suggestion: 'Interests power compatibility scores and Standouts.',
    },
    {
      id: 'intent',
      label: 'Set relationship intent',
      done: Boolean(user.intent),
      suggestion: 'Clear intent helps match with people on the same page.',
    },
    {
      id: 'emberPrompt',
      label: 'Add an Ember prompt',
      done:
        user.prompts?.some(
          (prompt) =>
            EMBER_PROMPT_OPTIONS.some((question) => question === prompt.question) &&
            prompt.answer.trim().length > 12,
        ) ?? false,
      suggestion: 'A discretion prompt tells Ember matches what this is — and isn’t.',
    },
    {
      id: 'photo',
      label: 'Verify your photos',
      done: user.photoVerified === true,
      suggestion: 'Photo verification shows your selfies match your profile.',
    },
    {
      id: 'person',
      label: 'Verify you are a real person',
      done: user.personVerified === true,
      suggestion: 'Liveness checks help everyone trust who they are matching with.',
    },
    {
      id: 'age',
      label: 'Verify your age',
      done: user.ageVerified === true,
      suggestion: 'Age verification builds trust and unlocks the 18+ badge.',
    },
  ];

  const doneCount = tips.filter((t) => t.done).length;
  const score = Math.round((doneCount / tips.length) * 100);
  return { score, tips };
}
