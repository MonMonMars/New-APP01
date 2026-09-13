export type ProfilePrompt = {
  question: string;
  answer: string;
};

export type ProfileGender = 'woman' | 'man' | 'nonbinary';

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
  prompts?: ProfilePrompt[];
  /** Hinge-style "Most Compatible" daily pick */
  mostCompatible?: boolean;
  /** Badoo-style Crush / spotlight profile */
  spotlight?: boolean;
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
};
