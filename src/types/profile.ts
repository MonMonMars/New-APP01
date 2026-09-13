export type ProfilePrompt = {
  question: string;
  answer: string;
};

export type Profile = {
  id: string;
  name: string;
  age: number;
  bio: string;
  distanceMiles: number;
  photos: string[];
  interests: string[];
  job?: string;
  school?: string;
  verified?: boolean;
  prompts?: ProfilePrompt[];
};

export type UserProfile = {
  name: string;
  age: number;
  bio: string;
  photos: string[];
  interests: string[];
};
