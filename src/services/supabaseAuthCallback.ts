import { Platform } from 'react-native';

import { getSupabaseClient } from './supabase';

export function getMagicLinkRedirectTo(): string | undefined {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return undefined;
    }
    return `${window.location.origin}${window.location.pathname}`;
  }
  return 'spark://auth/callback';
}

function parseAuthParams(url: string): {
  accessToken?: string;
  refreshToken?: string;
  code?: string;
  type?: string;
} {
  const read = (query: string) => {
    const params = new URLSearchParams(query);
    return {
      accessToken: params.get('access_token') ?? undefined,
      refreshToken: params.get('refresh_token') ?? undefined,
      code: params.get('code') ?? undefined,
      type: params.get('type') ?? undefined,
    };
  };

  const hashIndex = url.indexOf('#');
  if (hashIndex >= 0) {
    const fromHash = read(url.slice(hashIndex + 1));
    if (fromHash.accessToken || fromHash.code) {
      return fromHash;
    }
  }

  const queryIndex = url.indexOf('?');
  if (queryIndex >= 0) {
    return read(url.slice(queryIndex + 1));
  }

  return {};
}

export function authFlowTypeFromUrl(url: string): string | undefined {
  return parseAuthParams(url).type;
}

export async function applySupabaseAuthFromUrl(url: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return false;
  }

  const { accessToken, refreshToken, code } = parseAuthParams(url);
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return !error;
  }

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error;
  }

  return false;
}

export async function recoverSupabaseAuthFromLaunchUrl(): Promise<boolean> {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined') {
      return false;
    }
    const href = window.location.href;
    const hasAuthParams =
      href.includes('access_token=') ||
      href.includes('refresh_token=') ||
      href.includes('code=');

    if (!hasAuthParams) {
      const supabase = getSupabaseClient();
      if (!supabase) {
        return false;
      }
      const { data } = await supabase.auth.getSession();
      return Boolean(data.session);
    }

    const ok = await applySupabaseAuthFromUrl(href);
    if (ok) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    return ok;
  }

  return false;
}
