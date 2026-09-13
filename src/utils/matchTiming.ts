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

export function getMinutesUntilExpiry(expiresAt: string | undefined): number | null {
  if (!expiresAt) {
    return null;
  }
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return 0;
  }
  return Math.ceil(remainingMs / 60000);
}

export function formatExpiresIn(expiresAt: string | undefined): string | null {
  if (!expiresAt) {
    return null;
  }
  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return 'Expired';
  }

  const totalMinutes = Math.ceil(remainingMs / 60000);
  if (totalMinutes < 60) {
    return `Expires in ${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours < 24) {
    return minutes > 0 ? `Expires in ${hours}h ${minutes}m` : `Expires in ${hours}h`;
  }

  const days = Math.ceil(hours / 24);
  return `Expires in ${days}d`;
}
