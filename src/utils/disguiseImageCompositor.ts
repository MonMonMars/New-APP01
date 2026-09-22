import { Platform } from 'react-native';

import { DisguiseOverlayVariant } from '../types/disguise';
import { disguiseWorldMeta, hexToRgba } from './disguiseWorld';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 800;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load source photo'));
    image.src = url;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  width: number,
  height: number,
): void {
  const scale = Math.max(width / image.width, height / image.height);
  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;
  const x = (width - scaledWidth) / 2;
  const y = (height - scaledHeight) / 2;
  ctx.drawImage(image, x, y, scaledWidth, scaledHeight);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.toUpperCase().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) {
    lines.push(current);
  }
  return lines.slice(0, 3);
}

/** Bake news/ad text over a photo into a single JPEG data URL (web only). */
export async function compositeDisguiseImage(
  sourcePhotoUrl: string,
  overlayText: string,
  variant: DisguiseOverlayVariant,
  section?: string | null,
): Promise<string> {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return sourcePhotoUrl;
  }

  const image = await loadImage(sourcePhotoUrl);
  const canvas = document.createElement('canvas');
  canvas.width = CANVAS_WIDTH;
  canvas.height = CANVAS_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return sourcePhotoUrl;
  }

  const meta = disguiseWorldMeta(section);
  drawCover(ctx, image, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.fillStyle = hexToRgba(meta.navy, variant === 'news' ? 0.58 : 0.62);
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const badge = variant === 'news' ? 'BREAKING' : 'SPONSORED';

  ctx.textAlign = 'center';
  ctx.fillStyle = meta.accentBright;
  ctx.font = 'bold 36px system-ui, sans-serif';
  ctx.fillText(badge, CANVAS_WIDTH / 2, CANVAS_HEIGHT * 0.38);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 64px system-ui, sans-serif';
  const lines = wrapText(ctx, overlayText, CANVAS_WIDTH * 0.85);
  const lineHeight = 72;
  const startY = CANVAS_HEIGHT * 0.46;

  lines.forEach((line, index) => {
    ctx.shadowColor = 'rgba(0,0,0,0.75)';
    ctx.shadowBlur = 12;
    ctx.fillText(line, CANVAS_WIDTH / 2, startY + index * lineHeight);
  });
  ctx.shadowBlur = 0;

  if (variant === 'ad') {
    ctx.fillStyle = meta.accent;
    const buttonWidth = 280;
    const buttonHeight = 56;
    const buttonX = (CANVAS_WIDTH - buttonWidth) / 2;
    const buttonY = CANVAS_HEIGHT * 0.72;
    ctx.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px system-ui, sans-serif';
    ctx.fillText('SHOP NOW', CANVAS_WIDTH / 2, buttonY + 38);
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}
