import { LEGAL_ENTITY } from '../../constants/legalEntity';
import { AppLocale, resolveAppLocale } from '../../types/locale';
import { buildEnDocuments, LEGAL_CONTACT_EMAIL, LEGAL_PRIVACY_EMAIL } from './documents.en';
import { buildZhTwDocuments } from './documents.zh-TW';
import { LegalDocument, LegalDocumentId, LegalDocumentLink } from './types';

export type { LegalDocument, LegalDocumentId, LegalDocumentLink, LegalDocumentSection } from './types';
export { getLegalUiStrings } from './uiStrings';
export { LEGAL_CONTACT_EMAIL, LEGAL_PRIVACY_EMAIL };

const EFFECTIVE_EN = `Effective ${LEGAL_ENTITY.effectiveDate} · Updated ${LEGAL_ENTITY.lastUpdated}`;
const EFFECTIVE_ZH = `生效日期：${LEGAL_ENTITY.effectiveDate} · 最後更新：${LEGAL_ENTITY.lastUpdated}`;

const documentsByLocale: Record<AppLocale, Record<LegalDocumentId, LegalDocument>> = {
  en: buildEnDocuments(EFFECTIVE_EN),
  'zh-TW': buildZhTwDocuments(EFFECTIVE_ZH),
};

const linksByLocale: Record<AppLocale, LegalDocumentLink[]> = {
  en: [
    { id: 'terms', label: 'Terms of Service', icon: 'document-text-outline' },
    { id: 'privacy', label: 'Privacy Policy', icon: 'lock-closed-outline' },
    { id: 'community', label: 'Community Guidelines', icon: 'people-outline' },
    { id: 'disguise', label: 'Disguise Mode Policy', icon: 'eye-off-outline' },
    { id: 'verification', label: 'Verification Policy', icon: 'shield-checkmark-outline' },
    { id: 'cookies', label: 'Cookie Policy', icon: 'nutrition-outline' },
    { id: 'subscription', label: 'Subscription Terms', icon: 'card-outline' },
    { id: 'safety', label: 'Safety Disclaimer', icon: 'medkit-outline' },
  ],
  'zh-TW': [
    { id: 'terms', label: '使用者條款', icon: 'document-text-outline' },
    { id: 'privacy', label: '隱私政策', icon: 'lock-closed-outline' },
    { id: 'community', label: '社群規範', icon: 'people-outline' },
    { id: 'disguise', label: '偽裝模式政策', icon: 'eye-off-outline' },
    { id: 'verification', label: '驗證政策', icon: 'shield-checkmark-outline' },
    { id: 'cookies', label: 'Cookie 政策', icon: 'nutrition-outline' },
    { id: 'subscription', label: '訂閱條款', icon: 'card-outline' },
    { id: 'safety', label: '安全聲明', icon: 'medkit-outline' },
  ],
};

export function getLegalDocument(id: LegalDocumentId, locale?: AppLocale | null): LegalDocument {
  const resolved = resolveAppLocale(locale);
  return documentsByLocale[resolved][id];
}

export function getLegalDocumentLinks(locale?: AppLocale | null): LegalDocumentLink[] {
  const resolved = resolveAppLocale(locale);
  return linksByLocale[resolved];
}

/** @deprecated Use getLegalDocumentLinks(locale) */
export const legalDocumentLinks = linksByLocale.en;
