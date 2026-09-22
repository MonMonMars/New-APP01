export type PrivacyPreferences = {
  /** Product analytics and crash reporting */
  analyticsEnabled: boolean;
  /** Personalised recommendations */
  personalisationEnabled: boolean;
  /** Marketing email and push (separate from service notifications) */
  marketingConsent: boolean;
  /** Share approximate location for discovery */
  locationSharing: boolean;
  /** Show active / online status to matches */
  showActiveStatus: boolean;
  /** Browse without appearing in others' stacks until you like them (Spark+) */
  incognitoMode: boolean;
};

export const defaultPrivacyPreferences: PrivacyPreferences = {
  analyticsEnabled: false,
  personalisationEnabled: true,
  marketingConsent: false,
  locationSharing: true,
  showActiveStatus: true,
  incognitoMode: false,
};

export type LegalConsentRecord = {
  termsAcceptedAt: string | null;
  privacyAcceptedAt: string | null;
  communityAcceptedAt: string | null;
  disguisePolicyAcceptedAt: string | null;
  safetyAcknowledgedAt: string | null;
  verificationPolicyAcknowledgedAt: string | null;
  cookieConsentAt: string | null;
};

export const defaultLegalConsent: LegalConsentRecord = {
  termsAcceptedAt: null,
  privacyAcceptedAt: null,
  communityAcceptedAt: null,
  disguisePolicyAcceptedAt: null,
  safetyAcknowledgedAt: null,
  verificationPolicyAcknowledgedAt: null,
  cookieConsentAt: null,
};
