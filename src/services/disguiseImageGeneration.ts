import { Platform } from 'react-native';

import { DisguiseAdCreative, DisguiseOverlayVariant } from '../types/disguise';
import { compositeDisguiseImage } from '../utils/disguiseImageCompositor';
import { isProductionBuild } from '../utils/securityGuards';
import { getSupabaseClient, isSupabaseConfigured } from './supabase';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

type GenerateParams = {
  sourcePhotoUrl: string;
  overlayText: string;
  variant: DisguiseOverlayVariant;
  section?: string | null;
};

function buildAiPrompt(overlayText: string, variant: DisguiseOverlayVariant): string {
  if (variant === 'news') {
    return (
      `Breaking news social media thumbnail. Bold BREAKING badge in the brand accent color and large white uppercase headline text: "${overlayText}". ` +
      'Navy news overlay aesthetic, dramatic but professional, mobile feed style. No readable faces or identifiable people.'
    );
  }
  return (
    `Sponsored social media advertisement banner. Large bold white uppercase promo text: "${overlayText}". ` +
    'Navy gradient ad aesthetic, SPONSORED badge, shop-now button in the brand accent. Modern mobile feed sponsored post. No readable faces.'
  );
}

/** True when AI generation can run (Supabase proxy in prod, or dev OpenAI key). */
export function isDisguiseAiConfigured(): boolean {
  if (isSupabaseConfigured()) {
    return true;
  }
  if (isProductionBuild()) {
    return false;
  }
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  return Boolean(key && key.length > 10);
}

async function parseOpenAiImageUrl(response: Response): Promise<string> {
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `OpenAI request failed (${response.status})`);
  }

  const payload = (await response.json()) as { data?: { url?: string }[]; error?: { message?: string } };
  if (payload.error?.message) {
    throw new Error(payload.error.message);
  }
  const url = payload.data?.[0]?.url;
  if (!url) {
    throw new Error('OpenAI returned no image URL');
  }
  return url;
}

async function generateWithDisguiseProxy(params: GenerateParams): Promise<string> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error('Supabase client unavailable');
  }
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) {
    throw new Error('Sign in required for AI disguise generation');
  }

  const response = await fetch(`${SUPABASE_URL}/functions/v1/openai-disguise-proxy`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: buildAiPrompt(params.overlayText, params.variant),
    }),
  });

  return parseOpenAiImageUrl(response);
}

async function generateWithOpenAI(params: GenerateParams, apiKey: string): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: buildAiPrompt(params.overlayText, params.variant),
      size: '1024x1024',
      n: 1,
      response_format: 'url',
    }),
  });

  return parseOpenAiImageUrl(response);
}

async function generateLocally(params: GenerateParams): Promise<DisguiseAdCreative> {
  const bakedUrl = await compositeDisguiseImage(
    params.sourcePhotoUrl,
    params.overlayText,
    params.variant,
    params.section,
  );
  const usedCompositor = bakedUrl !== params.sourcePhotoUrl;

  return {
    imageUrl: bakedUrl,
    overlayText: params.overlayText,
    variant: params.variant,
    sourcePhotoUrl: params.sourcePhotoUrl,
    isAiGenerated: false,
    generatedAt: new Date().toISOString(),
    useOverlay: !usedCompositor,
  };
}

export async function generateDisguiseAdImage(params: GenerateParams): Promise<DisguiseAdCreative> {
  const trimmedText = params.overlayText.trim();
  if (!trimmedText) {
    throw new Error('Enter promo or headline text first.');
  }
  if (!params.sourcePhotoUrl) {
    throw new Error('Add a profile photo before generating a disguise ad.');
  }

  const normalizedParams = { ...params, overlayText: trimmedText };

  if (isSupabaseConfigured()) {
    try {
      const aiUrl = await generateWithDisguiseProxy(normalizedParams);
      return {
        imageUrl: aiUrl,
        overlayText: trimmedText,
        variant: params.variant,
        sourcePhotoUrl: params.sourcePhotoUrl,
        isAiGenerated: true,
        generatedAt: new Date().toISOString(),
      };
    } catch {
      // Fall through to dev direct OpenAI or local compositor.
    }
  }

  const apiKey = !isProductionBuild() ? process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim() : undefined;
  if (apiKey) {
    try {
      const aiUrl = await generateWithOpenAI(normalizedParams, apiKey);
      return {
        imageUrl: aiUrl,
        overlayText: trimmedText,
        variant: params.variant,
        sourcePhotoUrl: params.sourcePhotoUrl,
        isAiGenerated: true,
        generatedAt: new Date().toISOString(),
      };
    } catch {
      // Fall back to local compositor when AI is unavailable or rate-limited.
    }
  }

  const local = await generateLocally(normalizedParams);

  if (Platform.OS === 'web' && local.imageUrl.startsWith('data:')) {
    return {
      ...local,
      isAiGenerated: true,
    };
  }

  return local;
}
