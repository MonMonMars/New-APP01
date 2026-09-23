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
  postId?: string;
  articleUrl?: string;
};

export type PulseDisguiseTab = 'Home' | 'Trending' | 'Activity' | 'Profile';

export type PulseSocialState = {
  savedPostIds: string[];
  likedPostIds: string[];
  mutedAuthors: string[];
  reportedPostIds: string[];
  postComments: Record<string, PulseComment[]>;
  referralShareCount: number;
  readingHistory: PulseReadingEntry[];
  activityAlertsRead: boolean;
  /** Last Pulse bottom tab — reopen disguise mode here */
  pulseLastTab?: PulseDisguiseTab;
  /** Home feed scroll offset when leaving Pulse */
  pulseHomeScrollY?: number;
  /** Last Spark vs Ember context inside Pulse (accent + pool bias) */
  pulseLastWorldSection?: 'spark' | 'ember';
};

export function resolvePulseInitialTab(tab?: PulseDisguiseTab): PulseDisguiseTab {
  switch (tab) {
    case 'Home':
    case 'Trending':
    case 'Activity':
    case 'Profile':
      return tab;
    default:
      return 'Home';
  }
}

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
