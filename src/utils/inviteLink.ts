const INVITE_BASE = 'https://spark.app/invite';

/** Personalised invite URL — stable suffix from account id when available. */
export function buildInviteLink(userId: string | null | undefined): string {
  if (!userId) {
    return INVITE_BASE;
  }
  const suffix = userId.replace(/[^a-zA-Z0-9]/g, '').slice(-8).toLowerCase();
  return suffix.length >= 4 ? `${INVITE_BASE}/${suffix}` : INVITE_BASE;
}

export function buildInviteMessage(userName: string, inviteLink: string): string {
  const first = userName.trim().split(/\s+/)[0] || 'I';
  return `Join ${first} on Spark — dating with a private disguise mode when you need it. ${inviteLink}`;
}
