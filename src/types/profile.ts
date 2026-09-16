export type ProfilePrompt = {
  question: string;
  answer: string;
};

export const VOICE_PROMPT_QUESTIONS = [
  'My perfect Sunday sounds like…',
  'The way to win me over is…',
  'I geek out on…',
  'My most irrational fear is…',
  'Two truths and a lie…',
] as const;

export type VoicePrompt = {
  question: string;
  durationSeconds: number;
  recordedAt: string;
};

export type ProfileGender = 'woman' | 'man' | 'nonbinary';

export type Orientation =
  | 'straight'
  | 'gay'
  | 'lesbian'
  | 'bisexual'
  | 'pansexual'
  | 'queer'
  | 'asexual'
  | 'other';

export const ORIENTATION_LABELS: Record<Orientation, string> = {
  straight: 'Straight',
  gay: 'Gay',
  lesbian: 'Lesbian',
  bisexual: 'Bisexual',
  pansexual: 'Pansexual',
  queer: 'Queer',
  asexual: 'Asexual',
  other: 'Other',
};

export const GENDER_LABELS: Record<ProfileGender, string> = {
  woman: 'Woman',
  man: 'Man',
  nonbinary: 'Non-binary',
};

export const HINGE_PROMPT_OPTIONS = [
  'My simple pleasures',
  'I go crazy for',
  'Together we could',
  'The way to win me over is',
  'A life goal of mine',
  'My most controversial opinion',
  'I\'m looking for',
  'Typical Sunday',
  'Best travel story',
  'Green flags I look for',
] as const;

export type Profile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  distanceMiles: number;
  gender: ProfileGender;
  photos: string[];
  interests: string[];
  job?: string;
  school?: string;
  verified?: boolean;
  /** Selfie matches profile photos */
  photoVerified?: boolean;
  /** Liveness / real-person check passed */
  personVerified?: boolean;
  prompts?: ProfilePrompt[];
  /** Hinge-style "Most Compatible" daily pick */
  mostCompatible?: boolean;
  /** Badoo-style Crush / spotlight profile */
  spotlight?: boolean;
  /** Has a video profile (placeholder) */
  hasVideo?: boolean;
  /** Active within last 24h */
  activeToday?: boolean;
  /** Joined within last 7 days */
  isNew?: boolean;
  /** Bumble-style conversation starter shown on match */
  openingMove?: string;
  /** Hinge-style voice prompt on profile */
  voicePrompt?: VoicePrompt;
  /** Spark AI practice persona — not a real person */
  isAiPersona?: boolean;
  /** Links to AI_PERSONA_CONFIGS for chat personality */
  aiPersonaId?: string;
  /** Relationship intent — used for Spark+ advanced filters */
  intent?: RelationshipIntent;
  /** City label for map / discovery */
  city?: string;
  /** Fake map pin position (0–100 % of map viewport) */
  mapX?: number;
  mapY?: number;
  instagramHandle?: string;
  spotifyHandle?: string;
};

export type RelationshipIntent =
  | 'long_term'
  | 'short_term'
  | 'new_friends'
  | 'not_sure';

export type UserProfile = {
  name: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
  intent?: RelationshipIntent;
  gender?: ProfileGender;
  orientation?: Orientation;
  prompts?: ProfilePrompt[];
  /** Bumble-style Opening Move — shown to matches when you connect */
  openingMove?: string;
  /** Hinge-style voice prompt — optional audio intro */
  voicePrompt?: VoicePrompt;
  instagramConnected?: boolean;
  instagramHandle?: string;
  spotifyConnected?: boolean;
  spotifyHandle?: string;
  ageVerified?: boolean;
  photoVerified?: boolean;
  personVerified?: boolean;
};
