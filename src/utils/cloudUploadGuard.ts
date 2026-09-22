import { isSupabaseConfigured } from '../services/supabase';

export function needsCloudMediaUpload(
  uri: string | undefined,
  userId: string | null | undefined,
): boolean {
  if (!uri?.trim() || !userId || !isSupabaseConfigured()) {
    return false;
  }
  const trimmed = uri.trim();
  return !trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:');
}

export function cloudMediaUploadSucceeded(resolvedUri: string): boolean {
  return resolvedUri.startsWith('http://') || resolvedUri.startsWith('https://');
}
