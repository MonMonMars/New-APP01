export function getHoursUntilExpiry(expiresAt: string | undefined): number | null {
  if (!expiresAt) {
    return null;
  }
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return 0;
  }
  return Math.ceil(remainingMs / 3600000);
}

export function formatExpiresIn(expiresAt: string | undefined): string | null {
  const hours = getHoursUntilExpiry(expiresAt);
  if (hours === null) {
    return null;
  }
  if (hours <= 0) {
    return 'Expired';
  }
  if (hours < 24) {
    return `Expires in ${hours}h`;
  }
  const days = Math.ceil(hours / 24);
  return `Expires in ${days}d`;
}
