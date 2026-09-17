import { LEGAL_ENTITY } from '../constants/legalEntity';

export type LegalDocumentId =
  | 'terms'
  | 'privacy'
  | 'community'
  | 'disguise'
  | 'verification'
  | 'cookies'
  | 'subscription'
  | 'safety';

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

export const LEGAL_CONTACT_EMAIL = LEGAL_ENTITY.legalEmail;
export const LEGAL_PRIVACY_EMAIL = LEGAL_ENTITY.privacyEmail;

const effectiveLabel = `Effective ${LEGAL_ENTITY.effectiveDate} · Updated ${LEGAL_ENTITY.lastUpdated}`;

export const legalDocuments: Record<LegalDocumentId, LegalDocument> = {
  terms: {
    id: 'terms',
    title: 'Terms of Service',
    titleZh: '使用者條款',
    effective: effectiveLabel,
    intro: `These Terms govern your use of Spark and Pulse disguise mode operated by ${LEGAL_ENTITY.name}. By creating an account you agree to these Terms, our Privacy Policy, Community Guidelines, and related policies.`,
    sections: [
      {
        id: 'agreement',
        title: 'Agreement',
        body:
          'By creating an account, accessing, or using Spark you agree to these Terms, our Privacy Policy, Community Guidelines, Disguise Mode Policy, Trust & Verification Policy, Subscription Terms, and Safety Disclaimer. If you do not agree, do not use the Service.',
      },
      {
        id: 'eligibility',
        title: 'Eligibility',
        body:
          'You must be at least 18 years old (or the age of majority in your jurisdiction, whichever is higher). One person, one account. You must not be prohibited from using the Service under applicable law or previously banned. False age information is grounds for immediate termination.',
      },
      {
        id: 'account',
        title: 'Account registration',
        body:
          'You are responsible for your login credentials and all activity under your account. Provide accurate information and keep your profile up to date. You may not share, sell, or transfer your account.',
      },
      {
        id: 'service',
        title: 'What Spark provides',
        body:
          'Spark is a social discovery and dating platform. We do not guarantee matches, dates, relationships, compatibility, or the identity, intentions, or safety of any member. Verification badges are not background checks. Pulse disguise mode is an optional privacy feature — see the Disguise Mode Policy.',
      },
      {
        id: 'conduct',
        title: 'Your content and conduct',
        body:
          'You retain ownership of your photos and messages. You grant Spark a licence to host and display them to operate the Service. No harassment, fraud, impersonation, spam, illegal content, scraping, or using disguise mode to evade law enforcement. See Community Guidelines.',
      },
      {
        id: 'moderation',
        title: 'Moderation and enforcement',
        body:
          'We may remove content, suspend or terminate accounts, report illegal activity, and cooperate with law enforcement. We are not obligated to monitor all content but may do so.',
      },
      {
        id: 'payments',
        title: 'Subscriptions and purchases',
        body:
          'Spark+ and in-app purchases are billed through Apple App Store or Google Play. Subscriptions auto-renew until cancelled in your store settings. See Subscription Terms for billing, refunds, and cancellation details.',
      },
      {
        id: 'third-party',
        title: 'Third-party content',
        body:
          'Pulse may display sample news headlines, article summaries, or sponsored-style content for illustration. We do not control third-party websites and are not affiliated with illustrated publishers unless explicitly stated.',
      },
      {
        id: 'ip',
        title: 'Intellectual property',
        body:
          'Spark, Pulse, logos, and the Service design are our property or our licensors’. You may not copy, modify, or distribute them without written permission.',
      },
      {
        id: 'disclaimer',
        title: 'Disclaimers & liability',
        body:
          'The Service is provided "as is" and "as available". Dating involves real-world risk — you are solely responsible for in-person interactions. Our liability is limited to the maximum extent permitted by law. See Safety Disclaimer.',
      },
      {
        id: 'indemnity',
        title: 'Indemnification',
        body:
          'You agree to defend and hold harmless Spark Labs Ltd. from claims arising from your use of the Service, your content, your conduct, or your interactions with other members.',
      },
      {
        id: 'disputes',
        title: 'Dispute resolution',
        body:
          `Governed by the laws of ${LEGAL_ENTITY.jurisdiction}. Contact ${LEGAL_ENTITY.supportEmail} before formal proceedings. Courts of England and Wales have exclusive jurisdiction except where mandatory consumer laws require otherwise.`,
      },
      {
        id: 'termination',
        title: 'Termination & changes',
        body:
          'You may delete your account in Settings. We may suspend or terminate access for violations. Material Terms changes will be notified in-app or by email where required. Continued use after the effective date constitutes acceptance.',
      },
    ],
    footer: `${LEGAL_ENTITY.name} · ${LEGAL_ENTITY.address} · ${LEGAL_CONTACT_EMAIL} · 繁體中文版本可於官網查閱`,
  },
  privacy: {
    id: 'privacy',
    title: 'Privacy Policy',
    titleZh: '隱私政策',
    effective: effectiveLabel,
    intro: `${LEGAL_ENTITY.name} ("Spark", "we") explains how we collect, use, and protect personal data when you use Spark and Pulse. Biometric verification requires explicit consent where required by law.`,
    sections: [
      {
        id: 'controller',
        title: 'Data controller',
        body:
          `${LEGAL_ENTITY.name}, ${LEGAL_ENTITY.address}. Privacy contact: ${LEGAL_PRIVACY_EMAIL}. Data Protection Officer: ${LEGAL_ENTITY.dpoEmail}.`,
      },
      {
        id: 'collect',
        title: 'Data we collect',
        body:
          'Account info (name, email, age, gender, orientation), profile photos and bio, messages, location (with permission), usage and device logs, verification selfies/ID (when you start verification), purchase history from app stores, and cookie/analytics data on web (with consent).',
      },
      {
        id: 'use',
        title: 'How we use it',
        body:
          'To run matching, messaging, disguise mode, verification, fraud prevention, support, analytics (when enabled), personalisation (when enabled), and product improvement. Marketing only with consent or where permitted by law.',
      },
      {
        id: 'share',
        title: 'Who we share with',
        body:
          'Other members see what you put on your profile. We use identity vendors for verification, cloud hosts for storage, analytics providers (with consent on web), and may disclose data when required by law. We do not sell personal data.',
      },
      {
        id: 'cookies',
        title: 'Cookies & similar tech',
        body:
          'On web we use essential cookies to run the app and optional analytics cookies with your consent. See our Cookie Policy for details and how to change preferences.',
      },
      {
        id: 'rights',
        title: 'Your rights',
        body:
          'Depending on your region you may access, correct, delete, or port your data, object to processing, and withdraw consent. Email privacy@spark.app with "Data subject request". Delete your account in Settings → Privacy controls.',
      },
      {
        id: 'retention',
        title: 'Retention',
        body:
          'Account data until deletion. Verification media typically deleted within 30 days after a decision. Logs retained 12–24 months then aggregated or deleted. Cookie preferences stored until you clear them or withdraw consent.',
      },
      {
        id: 'security',
        title: 'Security',
        body:
          'We use encryption in transit, access controls, and monitoring. No method is 100% secure — report concerns to security@spark.app.',
      },
      {
        id: 'regions',
        title: 'Regional notices',
        body:
          'Additional rights may apply under GDPR/UK GDPR (EU/UK), CCPA/CPRA (California), Hong Kong PDPO, and Taiwan PDPA. Contact us for region-specific notices or to lodge a complaint with your supervisory authority.',
      },
      {
        id: 'children',
        title: 'Children',
        body: 'Spark is 18+ only. We do not knowingly collect data from anyone under 18. Contact us if you believe a minor has registered.',
      },
    ],
    footer: `Privacy questions: ${LEGAL_PRIVACY_EMAIL} · 繁體中文版本可於官網查閱`,
  },
  community: {
    id: 'community',
    title: 'Community Guidelines',
    titleZh: '社群規範',
    effective: effectiveLabel,
    intro: 'Spark is for respectful, honest connections — in both Spark dating mode and Pulse disguise mode. Violations may lead to warnings, restrictions, suspension, or permanent ban.',
    sections: [
      {
        id: 'respect',
        title: 'Be respectful',
        body:
          'No harassment, hate speech, slurs, threats, stalking, or unwanted contact after a block or unmatch. Treat others as you would in person.',
      },
      {
        id: 'honest',
        title: 'Be honest',
        body:
          'Use your own recent photos. Do not fake verification badges, impersonate others, or misrepresent your age, relationship status, or identity.',
      },
      {
        id: 'safe',
        title: 'Keep it safe',
        body:
          '18+ only. No illegal content, scams, revenge porn, non-consensual imagery, or soliciting money from strangers. No promoting violence or self-harm.',
      },
      {
        id: 'consent',
        title: 'Consent matters',
        body:
          'Do not share private chats, photos, or videos without consent. Respect boundaries in messages and when meeting in person.',
      },
      {
        id: 'disguise',
        title: 'Disguise mode rules',
        body:
          'Pulse is for privacy in public — not for stalking, fraud, or pretending disguised cards are real news/ads to third parties. See Disguise Mode Policy.',
      },
      {
        id: 'commercial',
        title: 'No spam or solicitation',
        body:
          'Do not use Spark for unsolicited advertising, pyramid schemes, escort services, or paid companionship without explicit permission from Spark.',
      },
      {
        id: 'enforce',
        title: 'Enforcement & appeals',
        body:
          'Report via in-app menu (profile or chat → Report). We review reports and may act without notice. Appeal at legal@spark.app with your account email.',
      },
    ],
    footer: `Community questions: ${LEGAL_CONTACT_EMAIL} · 繁體中文版本可於官網查閱`,
  },
  disguise: {
    id: 'disguise',
    title: 'Disguise Mode Policy',
    titleZh: '偽裝模式政策',
    effective: effectiveLabel,
    intro:
      'Pulse disguise mode shows dating activity as a news/social feed. This policy explains what it does and does not do.',
    sections: [
      {
        id: 'purpose',
        title: 'Purpose',
        body:
          'Disguise mode helps protect your privacy in public. It does not hide your data from Spark, make you anonymous to existing matches, or encrypt messages on your device.',
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
          'Do not use disguise mode to harass, scam, evade law enforcement, infringe trademarks, display others’ photos without consent, or mislead third parties about affiliations with news brands.',
      },
      {
        id: 'illustrations',
        title: 'Illustrated content',
        body:
          'Sample news brands (BBC, The Guardian, NPR, etc.) and ad-style cards in Pulse are illustrations only — not affiliations, endorsements, or live syndicated content.',
      },
      {
        id: 'ads',
        title: 'Disguised ads & promos',
        body:
          'Some cards may look like sponsored content. In disguise mode these represent Spark features (Boost, Spark+, etc.), not third-party advertisers, unless clearly labeled otherwise.',
      },
      {
        id: 'limits',
        title: 'Limitations',
        body:
          'Disguise mode cannot prevent screenshots, shoulder surfing, device access, or identification by people who know you. Lock your device, use app lock, and OS privacy features.',
      },
      {
        id: 'acceptance',
        title: 'Acceptance',
        body:
          'First-time activation and leaving disguise mode require acknowledging this policy. Continued use of disguise mode means you agree to these rules.',
      },
    ],
    footer: `Disguise mode questions: ${LEGAL_CONTACT_EMAIL} · 繁體中文版本可於官網查閱`,
  },
  verification: {
    id: 'verification',
    title: 'Trust & Verification Policy',
    titleZh: '信任與驗證政策',
    effective: effectiveLabel,
    intro:
      'Verification badges increase trust but are not background checks or safety guarantees. Some checks use regulated third-party providers.',
    sections: [
      {
        id: 'badges',
        title: 'Badge types',
        body:
          'Photo verified (selfie matches profile photos), Real person (liveness scan), Age 18+ (ID check via regulated provider). Each badge is independent.',
      },
      {
        id: 'data',
        title: 'Verification data',
        body:
          'Selfies, liveness frames, facial match scores, and ID images are processed to run checks. Third-party providers (e.g. Onfido, FaceTec, Yoti) may assist under strict contracts. Media is typically deleted after a decision; pass/fail status is stored on your account.',
      },
      {
        id: 'consent',
        title: 'Consent',
        body:
          'Starting verification means you consent to biometric and identity processing as described. You may skip verification; some features (e.g. Verified filter) may be unavailable.',
      },
      {
        id: 'limits',
        title: 'What badges do not mean',
        body:
          'Not a criminal background check. Not a guarantee of safety, character, or intentions. Badges may be revoked if photos change, fraud is suspected, or checks fail on re-review.',
      },
      {
        id: 'revocation',
        title: 'Revocation & appeals',
        body:
          'We may revoke badges without notice when checks fail or policy is violated. Appeal by emailing support@spark.app with "Verification appeal" and your account email.',
      },
    ],
    footer: `Verification questions: ${LEGAL_ENTITY.supportEmail} · Include "Verification" in the subject line · 繁體中文版本可於官網查閱`,
  },
  cookies: {
    id: 'cookies',
    title: 'Cookie Policy',
    titleZh: 'Cookie 政策',
    effective: effectiveLabel,
    intro: `This policy explains how ${LEGAL_ENTITY.name} uses cookies and similar technologies on Spark web. Mobile apps use device identifiers governed by our Privacy Policy.`,
    sections: [
      {
        id: 'what',
        title: 'What are cookies?',
        body:
          'Cookies are small text files stored on your browser. We also use local storage and similar tech for session state and preferences.',
      },
      {
        id: 'essential',
        title: 'Essential cookies',
        body:
          'Required to run Spark on web: login session, security tokens, disguise mode state, and consent preferences. These cannot be disabled while using the Service.',
      },
      {
        id: 'analytics',
        title: 'Analytics cookies (optional)',
        body:
          'With your consent we use anonymised analytics to understand usage and fix bugs. You can choose "Essential only" in the cookie banner or disable analytics in Privacy controls.',
      },
      {
        id: 'personalisation',
        title: 'Personalisation',
        body:
          'When enabled, we may store preferences to rank profiles and content. This is separate from marketing cookies and can be toggled in Privacy controls.',
      },
      {
        id: 'third-party',
        title: 'Third-party cookies',
        body:
          'We minimise third-party cookies. Payment flows on web may use store or payment-provider cookies subject to their policies. We do not use third-party ad trackers on Spark web.',
      },
      {
        id: 'manage',
        title: 'How to manage cookies',
        body:
          'Use the cookie banner on first visit, Privacy controls in Settings, or your browser settings to block/delete cookies. Blocking essential cookies may prevent Spark web from working.',
      },
      {
        id: 'retention',
        title: 'Retention',
        body:
          'Session cookies expire when you close the browser. Consent records persist until you withdraw consent or clear site data. Analytics cookies typically expire within 13 months.',
      },
    ],
    footer: `Cookie questions: ${LEGAL_PRIVACY_EMAIL} · 繁體中文版本可於官網查閱`,
  },
  subscription: {
    id: 'subscription',
    title: 'Subscription & Purchase Terms',
    titleZh: '訂閱與購買條款',
    effective: effectiveLabel,
    intro:
      'These terms apply to Spark+ subscriptions and in-app purchases (Boosts, Spark Notes, Roses, etc.) billed through Apple App Store, Google Play, or authorised payment providers.',
    sections: [
      {
        id: 'plans',
        title: 'Spark+ plans',
        body:
          'Spark+ is a recurring subscription (weekly, monthly, or annual) that unlocks premium features such as unlimited likes, See Who Likes You, rewinds, read receipts, and incognito mode. Feature availability may vary by region and platform.',
      },
      {
        id: 'billing',
        title: 'Billing & auto-renewal',
        body:
          'Payment is charged to your Apple ID or Google account at confirmation. Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. Your account is charged for renewal within 24 hours prior to period end.',
      },
      {
        id: 'cancel',
        title: 'Cancellation',
        body:
          'Cancel anytime in iOS Settings → Apple ID → Subscriptions or Google Play → Payments & subscriptions. Cancellation takes effect at the end of the current billing period. Deleting the app does not cancel your subscription.',
      },
      {
        id: 'consumables',
        title: 'Consumables',
        body:
          'Boosts, Spark Notes, Roses, and similar one-time purchases activate immediately and are non-refundable once consumed, except where store policy or law requires otherwise.',
      },
      {
        id: 'free-trial',
        title: 'Free trials & promos',
        body:
          'Introductory offers or free trials convert to paid subscriptions unless cancelled before the trial ends. Eligibility and pricing are shown at purchase and may change.',
      },
      {
        id: 'refunds',
        title: 'Refunds',
        body:
          'Refunds are handled by Apple or Google under their policies. Contact the store directly for billing disputes. We cannot process refunds for store purchases directly.',
      },
      {
        id: 'price-changes',
        title: 'Price changes',
        body:
          'We may change subscription prices with notice where required by the store or applicable law. Continued use after a price change constitutes acceptance where permitted.',
      },
      {
        id: 'demo',
        title: 'Demo builds',
        body:
          'Prototype and demo builds may simulate purchases without real charges. Production builds use live store billing.',
      },
    ],
    footer: `Billing questions: ${LEGAL_ENTITY.supportEmail} · 繁體中文版本可於官網查閱`,
  },
  safety: {
    id: 'safety',
    title: 'Safety Disclaimer',
    titleZh: '安全聲明',
    effective: effectiveLabel,
    intro:
      'Spark helps you meet people but cannot guarantee your safety. Please read this disclaimer before meeting anyone in person.',
    sections: [
      {
        id: 'risk',
        title: 'Inherent risk',
        body:
          'Online dating and meeting strangers carry inherent risks including harassment, fraud, assault, and theft. You assume all risks associated with your use of Spark and interactions with other members.',
      },
      {
        id: 'verification',
        title: 'Verification is not a safety guarantee',
        body:
          'Photo, liveness, and age badges confirm certain checks passed at a point in time. They are not background checks and do not mean someone is safe to meet alone.',
      },
      {
        id: 'meetings',
        title: 'Meeting in person',
        body:
          'Meet in public, tell a friend your plans, arrange your own transport, and trust your instincts. Use Date check-in in chat to share where you are meeting. Leave if you feel uncomfortable.',
      },
      {
        id: 'report',
        title: 'Report & block',
        body:
          'Report suspicious behaviour via profile or chat menu. Block removes someone from your deck and chats immediately. For emergencies contact local emergency services first, then support@spark.app.',
      },
      {
        id: 'resources',
        title: 'Resources',
        body:
          'Safety tips and FAQ at spark.app/safety. If you are in immediate danger, call your local emergency number. US: National Domestic Violence Hotline 1-800-799-7233. UK: 999.',
      },
      {
        id: 'liability',
        title: 'No duty to protect',
        body:
          'Spark is not responsible for the conduct of members on or off the platform. We provide tools to report and block but cannot prevent all harm. See Terms of Service for liability limits.',
      },
    ],
    footer: `Safety questions: ${LEGAL_ENTITY.supportEmail} · 繁體中文版本可於官網查閱`,
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
  { id: 'cookies', label: 'Cookie Policy', labelZh: 'Cookie 政策', icon: 'nutrition-outline' },
  { id: 'subscription', label: 'Subscription Terms', labelZh: '訂閱條款', icon: 'card-outline' },
  { id: 'safety', label: 'Safety Disclaimer', labelZh: '安全聲明', icon: 'medkit-outline' },
];
