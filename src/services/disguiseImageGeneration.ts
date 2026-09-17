import { Platform } from 'react-native';

import { DisguiseAdCreative, DisguiseOverlayVariant } from '../types/disguise';
import { compositeDisguiseImage } from '../utils/disguiseImageCompositor';
import { isProductionBuild } from '../utils/securityGuards';

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

export function isDisguiseAiConfigured(): boolean {
  if (isProductionBuild()) {
    return false;
  }
  const key = process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim();
  return Boolean(key && key.length > 10);
}

async function generateWithOpenAI(
  params: GenerateParams,
  apiKey: string,
): Promise<string> {
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

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `OpenAI request failed (${response.status})`);
  }

  const payload = (await response.json()) as { data?: { url?: string }[] };
  const url = payload.data?.[0]?.url;
  if (!url) {
    throw new Error('OpenAI returned no image URL');
  }
  return url;
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

export async function generateDisguiseAdImage(
  params: GenerateParams,
): Promise<DisguiseAdCreative> {
  const trimmedText = params.overlayText.trim();
  if (!trimmedText) {
    throw new Error('Enter promo or headline text first.');
  }
  if (!params.sourcePhotoUrl) {
    throw new Error('Add a profile photo before generating a disguise ad.');
  }

  const apiKey = !isProductionBuild() ? process.env.EXPO_PUBLIC_OPENAI_API_KEY?.trim() : undefined;
  if (apiKey) {
    try {
      const aiUrl = await generateWithOpenAI(params, apiKey);
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

  const local = await generateLocally({
    ...params,
    overlayText: trimmedText,
  });

  if (Platform.OS === 'web' && local.imageUrl.startsWith('data:')) {
    return {
      ...local,
      isAiGenerated: true,
    };
  }

  return local;
}
