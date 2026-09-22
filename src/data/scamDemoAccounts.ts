/** Demo-only scam markers for QA and admin detector training — not shown to end users as "fake". */
export const SCAM_DEMO_PROFILE_MARKERS: Record<
  string,
  { bioSnippet?: string; openerSnippet?: string; bonusScore?: number }
> = {
  '42': {
    openerSnippet: 'Can we move to WhatsApp? I have a crypto opportunity for you — send money via Cash App.',
    bonusScore: 38,
  },
  '67': {
    bioSnippet: 'Deployed overseas — need help with a wire transfer until I get home.',
    bonusScore: 40,
  },
  '103': {
    openerSnippet: 'Buy gift cards for me ASAP, I will pay you back double.',
    bonusScore: 45,
  },
};
