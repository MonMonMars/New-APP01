import { LEGAL_ENTITY } from '../constants/legalEntity';

export type PolicySection = {
  id: string;
  title: string;
  body: string;
};

export const VERIFICATION_POLICY_TITLE = 'Trust & Verification Policy';
export const VERIFICATION_POLICY_EFFECTIVE = `Effective ${LEGAL_ENTITY.effectiveDate} · Updated ${LEGAL_ENTITY.lastUpdated}`;

export const verificationPolicySections: PolicySection[] = [
  {
    id: 'purpose',
    title: 'What verification is for',
    body:
      'Spark verification badges help you see who has completed identity checks. Verification increases trust but is not a background check, criminal screening, or guarantee of safety. Always use your own judgment when meeting people.',
  },
  {
    id: 'photo',
    title: 'Photo verified',
    body:
      'You take a live selfie in the app. We compare it to your profile photos using facial matching. If they match, you earn the Photo verified badge. You may need to re-verify if you change your main photo.',
  },
  {
    id: 'person',
    title: 'Real person',
    body:
      'You complete a short liveness scan (blink, turn your head, follow prompts). This confirms a real human is present — not a bot, static image, or replay. It is separate from photo matching.',
  },
  {
    id: 'age',
    title: 'Age 18+',
    body:
      'You submit a government-issued photo ID through a secure flow. A regulated provider confirms you are at least 18. Spark stores pass/fail status, not your full ID document, unless law requires otherwise.',
  },
  {
    id: 'data',
    title: 'Data we use',
    body:
      'Verification may use selfies, short video frames, facial match scores, and ID images. Data is processed to run checks and prevent fraud. Third-party providers (e.g. Onfido, FaceTec, Yoti) may assist under strict contracts. Retention is limited — typically deleted after the decision.',
  },
  {
    id: 'consent',
    title: 'Your consent',
    body:
      'Starting verification means you agree to capture and process biometric and identity data as described. You can skip verification, but some features (like the Verified filter) may be unavailable.',
  },
  {
    id: 'limits',
    title: 'What badges do not mean',
    body:
      'Badges do not mean we ran a criminal background check, that someone is safe to meet alone, or that verification cannot be revoked. Report or block anyone who makes you uncomfortable.',
  },
  {
    id: 'revocation',
    title: 'Revocation & appeals',
    body:
      'We may revoke badges if photos change, fraud is suspected, or checks fail on re-review. You can appeal a decision by emailing support@spark.app with "Verification appeal".',
  },
  {
    id: 'contact',
    title: 'Contact',
    body: 'Questions or appeals: support@spark.app — include "Verification" in the subject line.',
  },
];

export const verificationHowItWorksSteps = [
  {
    step: '1',
    title: 'Open Profile',
    body: 'Go to Trust & verification on your Profile tab.',
  },
  {
    step: '2',
    title: 'Choose a check',
    body: 'Tap Verify next to Photo, Real person, or Age 18+.',
  },
  {
    step: '3',
    title: 'Follow prompts',
    body: 'Selfie, liveness scan, or ID upload — each takes about a minute.',
  },
  {
    step: '4',
    title: 'Badge appears',
    body: 'Passed checks show as labeled badges on your profile and cards.',
  },
];
