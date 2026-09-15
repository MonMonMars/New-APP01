export type LegalDocumentId =
  | 'terms'
  | 'privacy'
  | 'community'
  | 'disguise'
  | 'verification';

export type LegalDocumentSection = {
  id: string;
  title: string;
  body: string;
};

export type LegalDocument = {
  id: LegalDocumentId;
  title: string;
  titleZh: string;
  effective: string;
  intro: string;
  sections: LegalDocumentSection[];
  footer: string;
};

export const LEGAL_CONTACT_EMAIL = 'legal@spark.app';
export const LEGAL_PRIVACY_EMAIL = 'privacy@spark.app';

export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    titleZh: '使用者條款',
    effective: 'Effective 15 September 2025',
    intro:
      'By using Spark you agree to these Terms, our Privacy Policy, Community Guidelines, and related policies.',
    sections: [
      {
        id: 'eligibility',
        title: 'Eligibility',
        body:
          'You must be at least 18 years old. One person, one account. False age information is grounds for termination.',
      },
      {
        id: 'service',
        title: 'What Spark provides',
        body:
          'Spark is a dating and social discovery platform. We do not guarantee matches, safety, or the identity of other members. Verification badges are not background checks.',
      },
      {
        id: 'conduct',
        title: 'Your conduct',
        body:
          'No harassment, fraud, impersonation, spam, or illegal content. Disguise mode does not permit evading law enforcement or deceiving others for unlawful purposes.',
      },
      {
        id: 'content',
        title: 'Your content',
        body:
          'You own your photos and messages. You grant Spark a licence to host and display them to operate the Service. We may remove content and suspend accounts that violate our policies.',
      },
      {
        id: 'payments',
        title: 'Subscriptions',
        body:
          'Spark+ and in-app purchases are billed through Apple or Google. Subscriptions auto-renew until cancelled in your store settings unless required otherwise by law.',
      },
      {
        id: 'disclaimer',
        title: 'Disclaimers & liability',
        body:
          'The Service is provided "as is". You are responsible for in-person meetings and interactions. Our liability is limited to the maximum extent permitted by law. See full Terms in docs/legal/TERMS_OF_SERVICE.md.',
      },
      {
        id: 'disputes',
        title: 'Disputes',
        body:
          'Governed by the laws of England and Wales. Contact legal@spark.app before formal proceedings.',
      },
    ],
    footer: `Full legal text: docs/legal/TERMS_OF_SERVICE.md · 繁體中文: TERMS_OF_SERVICE.zh-TW.md · Questions: ${LEGAL_CONTACT_EMAIL}`,
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    titleZh: '隱私政策',
    effective: 'Effective [EFFECTIVE_DATE]',
    intro:
      'This summary explains how Spark collects and uses personal data. Biometric verification requires explicit consent where required by law.',
    sections: [
      {
        id: 'collect',
        title: 'Data we collect',
        body:
          'Account info, profile photos, location (with permission), messages, usage data, verification selfies/ID (when you start verification), device logs, and purchase history from app stores.',
      },
      {
        id: 'use',
        title: 'How we use it',
        body:
          'To run matching, messaging, disguise mode, verification, fraud prevention, support, and product improvement. Marketing only with consent or where permitted.',
      },
      {
        id: 'share',
        title: 'Who we share with',
        body:
          'Other members see what you put on your profile. We use identity vendors for verification, cloud hosts for storage, and may disclose data when required by law. We do not sell personal data.',
      },
      {
        id: 'rights',
        title: 'Your rights',
        body:
          'Depending on your region you may access, correct, delete, or port your data, and withdraw consent. Email privacy@spark.app with "Data subject request". Delete your account in Settings.',
      },
      {
        id: 'retention',
        title: 'Retention',
        body:
          'Account data until deletion. Verification media typically deleted within 30 days after a decision. Logs retained 12–24 months then aggregated or deleted.',
      },
      {
        id: 'regions',
        title: 'Regional notices',
        body:
          'Additional rights may apply under GDPR (EU/UK), CCPA (California), Hong Kong PDPO, and Taiwan PDPA. See docs/legal/PRIVACY_POLICY.md and PRIVACY_POLICY.zh-TW.md.',
      },
    ],
    footer: `Full policy: docs/legal/PRIVACY_POLICY.md · 繁體中文: PRIVACY_POLICY.zh-TW.md · ${LEGAL_PRIVACY_EMAIL}`,
  },
  community: {
    id: 'community',
    title: 'Community Guidelines',
    titleZh: '社群規範',
    effective: 'Effective [EFFECTIVE_DATE]',
    intro: 'Spark is for respectful, honest connections — in both Spark and Pulse disguise mode.',
    sections: [
      {
        id: 'respect',
        title: 'Be respectful',
        body: 'No harassment, hate speech, threats, or unwanted contact after a block.',
      },
      {
        id: 'honest',
        title: 'Be honest',
        body: 'Use your own recent photos. Do not fake verification badges or impersonate others.',
      },
      {
        id: 'safe',
        title: 'Keep it safe',
        body: '18+ only. No illegal content, scams, revenge porn, or soliciting money from strangers.',
      },
      {
        id: 'disguise',
        title: 'Disguise mode rules',
        body:
          'Pulse is for privacy in public — not for stalking, fraud, or pretending disguised cards are real news/ads to third parties.',
      },
      {
        id: 'enforce',
        title: 'Enforcement',
        body:
          'Violations may lead to warnings, restrictions, suspension, or permanent ban. Report via in-app menu. Appeal at legal@spark.app.',
      },
    ],
    footer: 'Full guidelines: docs/legal/COMMUNITY_GUIDELINES.md · 繁體中文: COMMUNITY_GUIDELINES.zh-TW.md',
  },
  disguise: {
    id: 'disguise',
    title: 'Disguise Mode Policy',
    titleZh: '偽裝模式政策',
    effective: 'Effective [EFFECTIVE_DATE]',
    intro:
      'Pulse disguise mode shows dating activity as a news/social feed. This policy explains what it does and does not do.',
    sections: [
      {
        id: 'purpose',
        title: 'Purpose',
        body:
          'Disguise mode helps protect your privacy in public. It does not hide your data from Spark or make you anonymous to existing matches.',
      },
      {
        id: 'owner',
        title: 'Owner-only cues',
        body:
          'Close reading shows labels like "Profile" and masked avatars so you can tell disguised cards apart from real news and ads. Strangers glancing at your screen may still notice a social app.',
      },
      {
        id: 'rules',
        title: 'Prohibited uses',
        body:
          'Do not use disguise mode to harass, scam, evade law enforcement, infringe trademarks, or display others’ photos without consent.',
      },
      {
        id: 'demo',
        title: 'Demo content',
        body:
          'Sample news brands (BBC, The Verge, etc.) in Pulse are illustrations only — not affiliations or endorsements.',
      },
      {
        id: 'limits',
        title: 'Limitations',
        body:
          'Disguise mode cannot prevent screenshots, device access, or identification by people who know you. Lock your device and use OS privacy features.',
      },
    ],
    footer: 'Full policy: docs/legal/DISGUISE_MODE_POLICY.md · 繁體中文: DISGUISE_MODE_POLICY.zh-TW.md',
  },
  verification: {
    id: 'verification',
    title: 'Trust & Verification Policy',
    titleZh: '信任與驗證政策',
    effective: 'Effective 14 September 2026',
    intro:
      'Verification badges increase trust but are not background checks or safety guarantees. Demo builds may simulate verification without real biometric processing.',
    sections: [
      {
        id: 'badges',
        title: 'Badge types',
        body:
          'Photo verified (selfie matches profile photos), Real person (liveness), Age 18+ (ID check via regulated provider).',
      },
      {
        id: 'data',
        title: 'Verification data',
        body:
          'Selfies, liveness frames, and ID images are processed to run checks. Media is typically deleted after a decision. Status is stored on your account.',
      },
      {
        id: 'consent',
        title: 'Consent',
        body:
          'Starting verification means you consent to biometric processing. You may skip verification; some features may be unavailable.',
      },
      {
        id: 'limits',
        title: 'What badges do not mean',
        body:
          'Not a criminal background check. Not a guarantee of safety or character. Badges may be revoked if photos change or fraud is suspected.',
      },
    ],
    footer: 'Full policy: docs/legal/TRUST_AND_VERIFICATION_POLICY.md · support@spark.app',
  },
};

export function getLegalDocument(id: LegalDocumentId): LegalDocument {
  return legalDocuments[id];
}

export const legalDocumentLinks: { id: LegalDocumentId; label: string; labelZh: string; icon: string }[] = [
  { id: 'terms', label: 'Terms of Service', labelZh: '使用者條款', icon: 'document-text-outline' },
  { id: 'privacy', label: 'Privacy Policy', labelZh: '隱私政策', icon: 'lock-closed-outline' },
  { id: 'community', label: 'Community Guidelines', labelZh: '社群規範', icon: 'people-outline' },
  { id: 'disguise', label: 'Disguise Mode Policy', labelZh: '偽裝模式政策', icon: 'eye-off-outline' },
  { id: 'verification', label: 'Verification Policy', labelZh: '驗證政策', icon: 'shield-checkmark-outline' },
];
