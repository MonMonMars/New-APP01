const ALLOWED_IMAGE_HOSTS = [
  'images.unsplash.com',
  'images.pexels.com',
  'upload.wikimedia.org',
  'picsum.photos',
  'media.giphy.com',
  'supabase.co',
  'supabase.in',
];

export function isSafeHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isAllowedImageUrl(url: string): boolean {
  if (url.startsWith('data:image/')) {
    return true;
  }
  if (url.startsWith('file://') || url.startsWith('content://')) {
    return true;
  }
  if (!isSafeHttpsUrl(url)) {
    return false;
  }
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_IMAGE_HOSTS.some(
      (allowed) => host === allowed || host.endsWith(`.${allowed}`),
    );
  } catch {
    return false;
  }
}

export function sanitizeExternalUrl(url: string): string | null {
  if (!isSafeHttpsUrl(url)) {
    return null;
  }
  return url;
}
