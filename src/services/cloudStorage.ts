import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const BUCKET = 'profile-photos';
const VOICE_BUCKET = 'voice-notes';

function extensionForAudioUri(localUri: string, blobType: string): string {
  if (localUri.includes('.webm')) {
    return 'webm';
  }
  if (localUri.includes('.m4a') || localUri.includes('.aac')) {
    return 'm4a';
  }
  if (blobType.includes('webm')) {
    return 'webm';
  }
  if (blobType.includes('mp4') || blobType.includes('m4a')) {
    return 'm4a';
  }
  return 'm4a';
}

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

function isRemoteUri(uri: string): boolean {
  return uri.startsWith('http://') || uri.startsWith('https://') || uri.startsWith('data:');
}

/** Upload a chat photo from the device gallery/camera. */
export async function uploadChatImageToCloud(userId: string, localUri: string): Promise<string> {
  if (!isSupabaseConfigured() || isRemoteUri(localUri)) {
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
    const path = `${userId}/chat/${Date.now()}.${ext}`;

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

/** Upload a recorded voice note; returns public HTTPS URL when cloud is configured. */
export async function uploadVoiceNoteToCloud(userId: string, localUri: string): Promise<string> {
  if (!isSupabaseConfigured() || isRemoteUri(localUri)) {
    return localUri;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return localUri;
  }

  try {
    const response = await fetch(localUri);
    const blob = await response.blob();
    const ext = extensionForAudioUri(localUri, blob.type);
    const path = `${userId}/voice/${Date.now()}.${ext}`;
    const contentType =
      blob.type || (ext === 'webm' ? 'audio/webm' : 'audio/mp4');

    const { error } = await supabase.storage.from(VOICE_BUCKET).upload(path, blob, {
      upsert: true,
      contentType,
    });

    if (error) {
      return localUri;
    }

    const { data } = supabase.storage.from(VOICE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  } catch {
    return localUri;
  }
}
