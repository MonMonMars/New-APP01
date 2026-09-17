import { AppLocale } from '../../types/locale';

type LegalUiCopy = {
  legalHeader: string;
  legalNotice: string;
  cookieTitle: string;
  cookieBodyPrefix: string;
  cookiePolicyLink: string;
  cookieAnd: string;
  privacyPolicyLink: string;
  cookieEssentialOnly: string;
  cookieAccept: string;
  subscriptionTermsLink: string;
  purchaseDemoNote: string;
  purchaseAutoRenew: string;
  onboardingAgreePrefix: string;
  onboardingCheckbox: string;
  onboardingContinue: string;
  linkSeparator: string;
  onboardingAgeNote: string;
  termsLink: string;
  privacyLink: string;
  communityLink: string;
  disguiseLink: string;
  safetyLink: string;
  verificationPolicyLink: string;
  verificationConsent: string;
  verificationNotGuarantee: string;
  disguiseModalTitle: string;
  disguiseBullets: string[];
  disguiseReadFull: string;
  disguiseAccept: (unlockLabel: string) => string;
  disguiseStay: (appName: string) => string;
  safetyLegalIntro: string;
  languageSection: string;
  privacyLanguage: string;
  privacyLanguageHint: string;
};

const en: LegalUiCopy = {
  legalHeader: 'Legal',
  legalNotice:
    'These summaries support in-app transparency. They are not legal advice. For formal requests or counsel review, contact legal@spark.app.',
  cookieTitle: 'Cookies & privacy',
  cookieBodyPrefix: 'We use essential cookies to run Spark on web. Optional analytics help us fix bugs. See our',
  cookiePolicyLink: 'Cookie Policy',
  cookieAnd: 'and',
  privacyPolicyLink: 'Privacy Policy',
  cookieEssentialOnly: 'Essential only',
  cookieAccept: 'Accept',
  subscriptionTermsLink: 'Subscription Terms',
  purchaseDemoNote: 'Demo purchase — no real charge. In production this uses Apple or Google billing.',
  purchaseAutoRenew: 'Subscriptions auto-renew until cancelled in your store settings.',
  onboardingAgreePrefix: "I agree to Spark's",
  onboardingCheckbox: 'I have read and agree to the policies above, including the Safety Disclaimer',
  onboardingContinue: 'Continue — I am 18+',
  linkSeparator: ', ',
  onboardingAgeNote: '. I am 18 or older.',
  termsLink: 'Terms',
  privacyLink: 'Privacy Policy',
  communityLink: 'Community Guidelines',
  disguiseLink: 'Disguise Mode Policy',
  safetyLink: 'Safety Disclaimer',
  verificationPolicyLink: 'Read Trust & Verification Policy',
  verificationConsent:
    'I agree to biometric and identity processing as described in the Verification Policy',
  verificationNotGuarantee: 'Verification badges are not background checks or safety guarantees.',
  disguiseModalTitle: 'Disguise mode policy',
  disguiseBullets: [
    'Pulse disguises dating activity as a news/social feed for privacy in public.',
    'Disguise does not hide your data from Spark or make you anonymous to existing matches.',
    'Do not use disguise to harass, scam, or impersonate news organisations.',
    'Sample BBC, Guardian, NPR, and ad brands in Pulse are illustrations — not real affiliations.',
    'Lock your device and use app lock — disguise cannot stop screenshots or device access.',
  ],
  disguiseReadFull: 'Read full Disguise Mode Policy',
  disguiseAccept: (unlockLabel) => `I understand — leave ${unlockLabel}`,
  disguiseStay: (appName) => `Stay in ${appName}`,
  safetyLegalIntro:
    'Read our terms, privacy policy, subscription terms, safety disclaimer, and all related policies below.',
  languageSection: 'Language',
  privacyLanguage: 'App language',
  privacyLanguageHint: 'Legal documents and policy summaries',
};

const zhTw: LegalUiCopy = {
  legalHeader: '法律文件',
  legalNotice:
    '以下摘要供 App 內透明揭露之用，不構成法律意見。正式請求或律師審閱請聯絡 legal@spark.app。',
  cookieTitle: 'Cookie 與隱私',
  cookieBodyPrefix: '我們使用必要 Cookie 以在網頁版運作 Spark。選用的分析資料有助修復錯誤。詳見',
  cookiePolicyLink: 'Cookie 政策',
  cookieAnd: '及',
  privacyPolicyLink: '隱私政策',
  cookieEssentialOnly: '僅必要',
  cookieAccept: '接受',
  subscriptionTermsLink: '訂閱條款',
  purchaseDemoNote: '示範購買 — 不會實際收費。正式版本使用 Apple 或 Google 計費。',
  purchaseAutoRenew: '訂閱將自動續訂，直至您在商店設定中取消。',
  onboardingAgreePrefix: '我同意 Spark 的',
  onboardingCheckbox: '我已閱讀並同意上述政策，包括安全聲明',
  onboardingContinue: '繼續 — 我已滿 18 歲',
  linkSeparator: '、',
  onboardingAgeNote: '。',
  termsLink: '使用者條款',
  privacyLink: '隱私政策',
  communityLink: '社群規範',
  disguiseLink: '偽裝模式政策',
  safetyLink: '安全聲明',
  verificationPolicyLink: '閱讀信任與驗證政策',
  verificationConsent: '我同意依驗證政策所述進行生物辨識與身分資料處理',
  verificationNotGuarantee: '驗證徽章並非背景調查或安全保證。',
  disguiseModalTitle: '偽裝模式政策',
  disguiseBullets: [
    'Pulse 將約會動態偽裝成新聞／社交動態，以便在公共場合保護隱私。',
    '偽裝不會向 Spark 隱藏您的資料，也不會讓您對既有配對匿名。',
    '不得利用偽裝騷擾、詐騙或冒充新聞機構。',
    'Pulse 中的 BBC、Guardian、NPR 等範例品牌僅為示意，非真實合作。',
    '請鎖定裝置並使用 App 鎖 — 偽裝無法防止截圖或他人使用您的裝置。',
  ],
  disguiseReadFull: '閱讀完整偽裝模式政策',
  disguiseAccept: (unlockLabel) => `我了解 — 離開 ${unlockLabel}`,
  disguiseStay: (appName) => `留在 ${appName}`,
  safetyLegalIntro: '以下可閱讀使用者條款、隱私政策、訂閱條款、安全聲明及所有相關政策。',
  languageSection: '語言',
  privacyLanguage: 'App 語言',
  privacyLanguageHint: '法律文件與政策摘要',
};

export function getLegalUiStrings(locale: AppLocale): LegalUiCopy {
  return locale === 'zh-TW' ? zhTw : en;
}
