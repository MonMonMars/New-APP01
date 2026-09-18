import { LegalDocumentId } from '../content/legalDocuments';
import { Conversation } from './match';
import { Profile } from './profile';

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  Chat: { conversationId: string };
  ProfileDetail: { profileId: string };
  SparkPlus: undefined;
  Safety: undefined;
  VerificationPolicy: undefined;
  LegalDocument: { documentId: LegalDocumentId };
  SecuritySettings: undefined;
  PrivacyCenter: undefined;
  SecurityProtocols: undefined;
  NotificationPreferences: undefined;
  ConsumablesShop: undefined;
  MapDiscover: undefined;
  Explore: undefined;
  DiscoverHub: undefined;
  PurchaseHistory: undefined;
};

export type MainTabParamList = {
  Discover: undefined;
  Likes: undefined;
  Matches: undefined;
  Profile: undefined;
};

export type ChatRouteParams = {
  conversation: Conversation;
};

export type ProfileDetailRouteParams = {
  profile: Profile;
};
