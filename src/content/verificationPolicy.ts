import { LEGAL_ENTITY } from '../constants/legalEntity';
import { AppLocale, resolveAppLocale } from '../types/locale';

export type PolicySection = {
  id: string;
  title: string;
  body: string;
};

export const VERIFICATION_POLICY_TITLE = 'Trust & Verification Policy';
export const VERIFICATION_POLICY_EFFECTIVE = `Effective ${LEGAL_ENTITY.effectiveDate} · Updated ${LEGAL_ENTITY.lastUpdated}`;

const sectionsEn: PolicySection[] = [
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

const sectionsZhTw: PolicySection[] = [
  {
    id: 'purpose',
    title: '驗證的目的',
    body:
      'Spark 驗證徽章協助您了解誰已完成身分檢查。驗證可提升信任，但並非背景調查、刑事篩查或安全保證。見面時請始終自行判斷。',
  },
  {
    id: 'photo',
    title: '照片驗證',
    body:
      '您在 App 內拍攝即時自拍。我們以人臉比對與個人檔案照片比對。若相符，您將獲得照片驗證徽章。若更換主要照片，可能需要重新驗證。',
  },
  {
    id: 'person',
    title: '真人驗證',
    body:
      '您完成簡短活體掃描（眨眼、轉頭、依提示動作）。此確認為真人而非機器人、靜態圖片或重播。與照片比對為不同檢查。',
  },
  {
    id: 'age',
    title: '年滿 18 歲',
    body:
      '您透過安全流程提交政府核發之附照身分證件。受監管之服務商確認您至少 18 歲。Spark 儲存通過／未通過狀態，除非法律要求，不保留完整證件影像。',
  },
  {
    id: 'data',
    title: '我們使用的資料',
    body:
      '驗證可能使用自拍、短影片畫面、人臉比對分數及證件影像。資料用於執行檢查及防止詐欺。第三方服務商（如 Onfido、FaceTec、Yoti）可能在嚴格合約下協助。保留期限有限 — 通常於決定後刪除。',
  },
  {
    id: 'consent',
    title: '您的同意',
    body:
      '開始驗證即表示您同意依說明擷取並處理生物辨識與身分資料。您可略過驗證，但部分功能（如已驗證篩選）可能無法使用。',
  },
  {
    id: 'limits',
    title: '徽章不代表什麼',
    body:
      '徽章不代表我們已進行刑事背景調查、對方可單獨安全見面，或驗證不可被撤銷。若有人讓您不適，請檢舉或封鎖。',
  },
  {
    id: 'revocation',
    title: '撤銷與申訴',
    body:
      '若照片變更、疑似詐欺或複審未通過，我們可能撤銷徽章。可寄信 support@spark.app，主旨注明「Verification appeal」提出申訴。',
  },
  {
    id: 'contact',
    title: '聯絡方式',
    body: '問題或申訴：support@spark.app — 主旨請包含「Verification」。',
  },
];

const stepsEn = [
  { step: '1', title: 'Open Profile', body: 'Go to Trust & verification on your Profile tab.' },
  { step: '2', title: 'Choose a check', body: 'Tap Verify next to Photo, Real person, or Age 18+.' },
  { step: '3', title: 'Follow prompts', body: 'Selfie, liveness scan, or ID upload — each takes about a minute.' },
  { step: '4', title: 'Badge appears', body: 'Passed checks show as labeled badges on your profile and cards.' },
];

const stepsZhTw = [
  { step: '1', title: '開啟個人檔案', body: '在個人檔案分頁前往「信任與驗證」。' },
  { step: '2', title: '選擇檢查項目', body: '在照片、真人或年滿 18 歲旁點選驗證。' },
  { step: '3', title: '依提示操作', body: '自拍、活體掃描或證件上傳 — 每項約需一分鐘。' },
  { step: '4', title: '徽章顯示', body: '通過的檢查會以標示徽章顯示於個人檔案與卡片上。' },
];

export function getVerificationPolicyTitle(locale?: AppLocale | null): string {
  return resolveAppLocale(locale) === 'zh-TW' ? '信任與驗證政策' : VERIFICATION_POLICY_TITLE;
}

export function getVerificationPolicyEffective(locale?: AppLocale | null): string {
  const resolved = resolveAppLocale(locale);
  return resolved === 'zh-TW'
    ? `生效日期：${LEGAL_ENTITY.effectiveDate} · 最後更新：${LEGAL_ENTITY.lastUpdated}`
    : VERIFICATION_POLICY_EFFECTIVE;
}

export function getVerificationPolicySections(locale?: AppLocale | null): PolicySection[] {
  return resolveAppLocale(locale) === 'zh-TW' ? sectionsZhTw : sectionsEn;
}

export function getVerificationHowItWorksSteps(locale?: AppLocale | null) {
  return resolveAppLocale(locale) === 'zh-TW' ? stepsZhTw : stepsEn;
}

/** @deprecated Use getVerificationPolicySections(locale) */
export const verificationPolicySections = sectionsEn;

/** @deprecated Use getVerificationHowItWorksSteps(locale) */
export const verificationHowItWorksSteps = stepsEn;
