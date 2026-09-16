export type PulseComment = {
  author: string;
  handle: string;
  body: string;
  sentAt: string;
};

export type PulseReadingEntry = {
  title: string;
  source: string;
  readAt: string;
};

export type PulseSocialState = {
  savedPostIds: string[];
  likedPostIds: string[];
  mutedAuthors: string[];
  reportedPostIds: string[];
  postComments: Record<string, PulseComment[]>;
  referralShareCount: number;
  readingHistory: PulseReadingEntry[];
  activityAlertsRead: boolean;
};

export const defaultPulseSocialState: PulseSocialState = {
  savedPostIds: [],
  likedPostIds: [],
  mutedAuthors: [],
  reportedPostIds: [],
  postComments: {},
  referralShareCount: 0,
  readingHistory: [],
  activityAlertsRead: false,
};
