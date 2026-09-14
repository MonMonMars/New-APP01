import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const BUCKET = 'profile-photos';

/** Upload a local image URI to Supabase Storage (cloud). Returns public HTTPS URL. */
export async function uploadProfilePhotoToCloud(
  userId: string,
  localUri: string,
): Promise<string> {
  if (!isSupabaseConfigured() || localUri.startsWith('http')) {
    return localUri;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return localUri;
  }

  try {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const ext = blob.type.includes('png') ? 'png' : 'jpg';
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      upsert: true,
      contentType: blob.type || `image/${ext}`,
    });

    if (error) {
      return localUri;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return localUri;
  }
}

/** Upload multiple photos; keeps existing cloud URLs as-is. */
export async function uploadPhotosToCloud(
  userId: string,
  uris: string[],
): Promise<string[]> {
  const results: string[] = [];
  for (const uri of uris) {
    results.push(await uploadProfilePhotoToCloud(userId, uri));
  }
  return results;
}
