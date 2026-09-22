export type DisguiseOverlayVariant = 'news' | 'ad';

export type DisguiseAdCreative = {
  imageUrl: string;
  overlayText: string;
  variant: DisguiseOverlayVariant;
  sourcePhotoUrl: string;
  isAiGenerated: boolean;
  generatedAt: string;
  /** When true, render live overlay on imageUrl (native fallback before bake). */
  useOverlay?: boolean;
};
