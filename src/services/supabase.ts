import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { Conversation, Match } from '../types/match';
import { DiscoveryPreferences } from '../types/preferences';
import { UserProfile } from '../types/profile';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}

export type SyncPayload = {
  userId: string;
  user: UserProfile;
  preferences: DiscoveryPreferences;
  passedIds: string[];
  likedIds: string[];
  pendingLikeIds: string[];
  blockedIds: string[];
  matches: Match[];
  conversations: Conversation[];
  isSparkPlus: boolean;
  isPaused: boolean;
};

export async function getSupabaseSession(): Promise<{ userId: string } | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }
  const { data } = await supabase.auth.getSession();
  if (data.session?.user) {
    return { userId: data.session.user.id };
  }
  return null;
}

export async function signInWithMagicLink(email: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { ok: false, error: 'Supabase not configured' };
  }
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) {
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function signInWithAppleToken(
  identityToken: string,
  displayName?: string,
): Promise<{ userId: string | null; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { userId: null, error: 'Supabase not configured' };
  }
  const { data, error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: identityToken,
  });
  if (error || !data.user) {
    return { userId: null, error: error?.message ?? 'Apple sign-in failed' };
  }

  if (displayName) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      name: displayName,
      updated_at: new Date().toISOString(),
    });
  }

  return { userId: data.user.id };
}

export async function ensureProfileRow(userId: string, user: UserProfile): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.from('profiles').upsert({
    id: userId,
    name: user.name,
    age: user.age,
    bio: user.bio,
    photos: user.photos,
    interests: user.interests,
    intent: user.intent ?? null,
    gender: user.gender ?? null,
    orientation: user.orientation ?? null,
    prompts: user.prompts ?? [],
    instagram_connected: user.instagramConnected ?? false,
    spotify_connected: user.spotifyConnected ?? false,
    age_verified: user.ageVerified ?? false,
    photo_verified: user.photoVerified ?? false,
    person_verified: user.personVerified ?? false,
    updated_at: new Date().toISOString(),
  });
}

export async function syncToSupabase(payload: SyncPayload): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { userId, user, preferences, passedIds, likedIds, pendingLikeIds, blockedIds, matches, conversations, isSparkPlus, isPaused } = payload;

  await ensureProfileRow(userId, user);

  await supabase.from('user_preferences').upsert({
    user_id: userId,
    max_distance_miles: preferences.maxDistanceMiles,
    min_age: preferences.minAge,
    max_age: preferences.maxAge,
    show_me: preferences.showMe,
    passport_city: preferences.passportCity ?? null,
    travel_mode: preferences.travelMode ?? false,
    discover_filters: preferences.discoverFilters ?? [],
    updated_at: new Date().toISOString(),
  });

  await supabase.from('user_state').upsert({
    user_id: userId,
    passed_ids: passedIds,
    liked_ids: likedIds,
    pending_like_ids: pendingLikeIds,
    blocked_ids: blockedIds,
    is_spark_plus: isSparkPlus,
    is_paused: isPaused,
    updated_at: new Date().toISOString(),
  });

  for (const match of matches) {
    await supabase.from('matches').upsert({
      id: match.id,
      user_id: userId,
      profile_id: match.profile.id,
      profile_data: match.profile,
      matched_at: match.matchedAt,
      expires_at: match.expiresAt ?? null,
    });
  }

  for (const conversation of conversations) {
    await supabase.from('conversations').upsert({
      id: conversation.id,
      user_id: userId,
      match_id: conversation.match.id,
      messages: conversation.messages,
      your_turn: conversation.yourTurn,
      unread: conversation.unread,
      last_message: conversation.lastMessage ?? null,
      last_message_at: conversation.lastMessageAt ?? null,
      updated_at: new Date().toISOString(),
    });
  }
}

export async function loadFromSupabase(userId: string): Promise<Partial<SyncPayload> | null> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const [profileRes, prefsRes, stateRes, matchesRes, convsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_preferences').select('*').eq('user_id', userId).single(),
    supabase.from('user_state').select('*').eq('user_id', userId).single(),
    supabase.from('matches').select('*').eq('user_id', userId),
    supabase.from('conversations').select('*').eq('user_id', userId),
  ]);

  if (profileRes.error && profileRes.error.code !== 'PGRST116') {
    return null;
  }

  const profile = profileRes.data;
  const prefs = prefsRes.data;
  const state = stateRes.data;

  const user: UserProfile = profile
    ? {
        name: profile.name ?? 'Spark User',
        age: profile.age ?? 25,
        bio: profile.bio ?? '',
        photos: profile.photos ?? [],
        interests: profile.interests ?? [],
        intent: profile.intent,
        gender: profile.gender,
        orientation: profile.orientation,
        prompts: profile.prompts ?? [],
        instagramConnected: profile.instagram_connected ?? false,
        spotifyConnected: profile.spotify_connected ?? false,
        ageVerified: profile.age_verified ?? false,
        photoVerified: profile.photo_verified ?? false,
        personVerified: profile.person_verified ?? false,
      }
    : {
        name: 'Spark User',
        age: 25,
        bio: '',
        photos: [],
        interests: [],
      };

  const preferences: DiscoveryPreferences = prefs
    ? {
        maxDistanceMiles: prefs.max_distance_miles ?? 25,
        minAge: prefs.min_age ?? 21,
        maxAge: prefs.max_age ?? 35,
        showMe: prefs.show_me ?? 'everyone',
        passportCity: prefs.passport_city,
        travelMode: prefs.travel_mode ?? false,
        discoverFilters: prefs.discover_filters ?? [],
      }
    : {
        maxDistanceMiles: 25,
        minAge: 21,
        maxAge: 35,
        showMe: 'everyone',
      };

  const matches: Match[] = (matchesRes.data ?? []).map((row) => ({
    id: row.id,
    profile: row.profile_data,
    matchedAt: row.matched_at,
    expiresAt: row.expires_at,
  }));

  const conversations: Conversation[] = (convsRes.data ?? []).map((row) => ({
    id: row.id,
    match: matches.find((m) => m.id === row.match_id) ?? {
      id: row.match_id,
      profile: { id: 'unknown', name: 'Unknown', age: 0, bio: '', distanceMiles: 0, gender: 'woman', photos: [], interests: [] },
      matchedAt: row.updated_at,
    },
    messages: row.messages ?? [],
    yourTurn: row.your_turn ?? false,
    unread: row.unread ?? false,
    lastMessage: row.last_message,
    lastMessageAt: row.last_message_at,
  }));

  return {
    userId,
    user,
    preferences,
    passedIds: state?.passed_ids ?? [],
    likedIds: state?.liked_ids ?? [],
    pendingLikeIds: state?.pending_like_ids ?? [],
    blockedIds: state?.blocked_ids ?? [],
    matches,
    conversations,
    isSparkPlus: state?.is_spark_plus ?? false,
    isPaused: state?.is_paused ?? false,
  };
}

export async function deleteSupabaseAccount(userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }
  await supabase.from('conversations').delete().eq('user_id', userId);
  await supabase.from('matches').delete().eq('user_id', userId);
  await supabase.from('user_state').delete().eq('user_id', userId);
  await supabase.from('user_preferences').delete().eq('user_id', userId);
  await supabase.from('profiles').delete().eq('id', userId);
  await supabase.auth.signOut();
}
