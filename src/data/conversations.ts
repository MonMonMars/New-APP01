import { Conversation } from '../types/match';

import { buildSeedConversations, buildSeedMatches } from './seedState';

/** Rich demo threads — same source as fresh-install hydration. */
export const seedConversations: Conversation[] = buildSeedConversations(buildSeedMatches());
