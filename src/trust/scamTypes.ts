export type ScamRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ScamSignalCategory =
  | 'off_platform'
  | 'money_request'
  | 'crypto_investment'
  | 'urgency_pressure'
  | 'identity_story'
  | 'link_phishing'
  | 'unverified_new'
  | 'love_bombing'
  | 'gift_card'
  | 'admin_confirmed';

export type ScamSignal = {
  id: string;
  category: ScamSignalCategory;
  weight: number;
  excerpt?: string;
};

export type ScamAssessment = {
  profileId: string;
  score: number;
  level: ScamRiskLevel;
  signals: ScamSignal[];
  assessedAt: string;
};

export type CustomerProtectionTier = 'monitor' | 'warn' | 'restrict' | 'quarantine';

export type CustomerProtectionPlan = {
  tier: CustomerProtectionTier;
  hideFromDiscover: boolean;
  showChatBanner: boolean;
  showProfileWarning: boolean;
  blockOutgoingLinks: boolean;
  recommendBlockAndReport: boolean;
  protocolSteps: string[];
};
