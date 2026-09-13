import { Profile } from '../types/profile';

/** Profiles that instantly match when liked — minority for demo realism. */
export const MUTUAL_MATCH_IDS = new Set(['3']);

export const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'Ava',
    age: 26,
    gender: 'woman',
    bio: 'Coffee person. Weekend hikes. Looking for someone who laughs at bad puns.',
    distanceMiles: 2,
    job: 'Product Designer',
    school: 'RISD',
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80',
    ],
    interests: ['Hiking', 'Photography', 'Espresso'],
    prompts: [
      { question: 'My simple pleasures', answer: 'Morning coffee and a long walk.' },
      { question: 'I go crazy for', answer: 'Live music and good typography.' },
    ],
  },
  {
    id: '2',
    name: 'Jordan',
    age: 29,
    gender: 'man',
    bio: 'Designer by day, vinyl collector by night. Let’s grab tacos.',
    distanceMiles: 5,
    job: 'UX Lead',
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80',
    ],
    interests: ['Design', 'Music', 'Food'],
    prompts: [
      { question: 'Together we could', answer: 'Hunt for the best taco spot in town.' },
    ],
  },
  {
    id: '3',
    name: 'Mia',
    age: 24,
    gender: 'woman',
    bio: 'Yoga, travel, and trying every ramen spot in the city.',
    distanceMiles: 1,
    job: 'Marketing',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
    ],
    interests: ['Travel', 'Yoga', 'Ramen'],
    prompts: [
      { question: 'The way to win me over is', answer: 'Recommend a hidden gem restaurant.' },
    ],
  },
  {
    id: '4',
    name: 'Chris',
    age: 31,
    gender: 'man',
    bio: 'Startup founder. Dog dad. Will share playlist recommendations.',
    distanceMiles: 8,
    job: 'Founder',
    photos: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80'],
    interests: ['Startups', 'Dogs', 'Indie rock'],
  },
  {
    id: '5',
    name: 'Sofia',
    age: 27,
    gender: 'woman',
    bio: 'Museum dates > club dates. Currently learning pottery.',
    distanceMiles: 3,
    job: 'Curator',
    verified: true,
    photos: [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
    ],
    interests: ['Art', 'Pottery', 'Wine'],
    prompts: [
      { question: 'Typical Sunday', answer: 'Gallery hop then wine on the terrace.' },
    ],
  },
  {
    id: '6',
    name: 'Leo',
    age: 28,
    gender: 'man',
    bio: 'Runner. Amateur chef. Looking for a co-pilot for spontaneous road trips.',
    distanceMiles: 6,
    job: 'Engineer',
    photos: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80'],
    interests: ['Running', 'Cooking', 'Road trips'],
  },
];

export const incomingLikeProfiles: Profile[] = [
  {
    id: '7',
    name: 'Emma',
    age: 25,
    gender: 'woman',
    bio: 'Bookworm and brunch enthusiast.',
    distanceMiles: 4,
    photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80'],
    interests: ['Books', 'Brunch'],
  },
  {
    id: '8',
    name: 'Noah',
    age: 30,
    gender: 'man',
    bio: 'Climber. Dog person. Always planning the next trip.',
    distanceMiles: 7,
    photos: ['https://images.unsplash.com/photo-1504257432389-52343af06da3?w=800&q=80'],
    interests: ['Climbing', 'Travel'],
  },
  {
    id: '9',
    name: 'Zoe',
    age: 23,
    gender: 'woman',
    bio: 'Film student. Loves indie cinemas.',
    distanceMiles: 2,
    photos: ['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80'],
    interests: ['Film', 'Photography'],
  },
  {
    id: '10',
    name: 'Sam',
    age: 27,
    gender: 'man',
    bio: 'Chef. Will cook for you on the second date.',
    distanceMiles: 5,
    photos: ['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800&q=80'],
    interests: ['Cooking', 'Wine'],
  },
];

export function getProfileById(id: string): Profile | undefined {
  return [...mockProfiles, ...incomingLikeProfiles].find((p) => p.id === id);
}
