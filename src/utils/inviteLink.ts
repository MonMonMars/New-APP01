import { translate } from '../i18n';
import { AppLocale, resolveAppLocale } from '../types/locale';

const INVITE_BASE = 'https://spark.app/invite';

/** Personalised invite URL — stable suffix from account id when available. */
export function buildInviteLink(userId: string | null | undefined): string {
  if (!userId) {
    return INVITE_BASE;
  }
  const suffix = userId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toLowerCase();
  return suffix.length >= 4 ? `${INVITE_BASE}/${suffix}` : INVITE_BASE;
}

export function buildInviteMessage(
  userName: string,
  inviteLink: string,
  locale?: AppLocale | null,
): string {
  const resolvedLocale = resolveAppLocale(locale);
  const first = userName.trim().split(/\s+/)[0] || 'I';
  return translate(resolvedLocale, 'referral.shareMessage', { name: first, link: inviteLink });
}
