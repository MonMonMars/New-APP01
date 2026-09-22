/** Bumble Suggest a Date–inspired icebreakers for moving offline. */
export const DATE_SUGGESTIONS = [
  { id: 'coffee', label: 'Coffee this week?', message: 'Want to grab coffee this week? I know a great spot nearby.' },
  { id: 'walk', label: 'Walk in the park', message: 'Fancy a walk in the park this weekend? Low pressure, good vibes.' },
  { id: 'food', label: 'Try a new restaurant', message: 'I have been wanting to try a new place — want to check it out together?' },
  { id: 'drinks', label: 'Drinks after work', message: 'Free for drinks after work one evening this week?' },
  { id: 'activity', label: 'Mini adventure', message: 'Up for a mini adventure — gallery, market, or something spontaneous?' },
  { id: 'video', label: 'Quick video chat', message: 'Want to do a quick video chat first? Tinder-style vibe check 😊' },
] as const;

export type DateSuggestion = (typeof DATE_SUGGESTIONS)[number];
