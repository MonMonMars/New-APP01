import { Platform } from 'react-native';

const STYLE_ID = 'spark-web-motion';

const CSS = `
@keyframes spark-fade-up {
  from { opacity: 0; transform: translate3d(0, 12px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes spark-sheet-in {
  from { opacity: 0; transform: translate3d(0, 20px, 0) scale(0.94); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}
@keyframes spark-bottom-sheet-in {
  from { opacity: 0; transform: translate3d(0, 28px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes spark-veil {
  0% { opacity: 0; }
  35% { opacity: 1; }
  100% { opacity: 0; }
}
@keyframes spark-press-pop {
  0% { transform: scale(1); }
  40% { transform: scale(0.94); }
  70% { transform: scale(1.04); }
  100% { transform: scale(1); }
}
@keyframes spark-press-glow {
  0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.42); }
  100% { box-shadow: 0 0 0 14px rgba(255,255,255,0); }
}
@keyframes spark-page-in {
  from { opacity: 0; transform: translate3d(18px, 0, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes spark-profile-swap-out {
  from { opacity: 1; }
  to { opacity: 0; }
}
@keyframes spark-profile-swap-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes spark-pulse-top-bar {
  0% { transform: translate3d(-120%, 0, 0); }
  100% { transform: translate3d(320%, 0, 0); }
}
@keyframes spark-pulse-feed-spring {
  from { opacity: 0.55; transform: translate3d(0, -10px, 0); }
  to { opacity: 1; transform: translate3d(0, 0, 0); }
}
@keyframes spark-pulse-refresh-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.spark-fade-up {
  animation: spark-fade-up 340ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.spark-sheet-in {
  animation: spark-sheet-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.spark-bottom-sheet-in {
  animation: spark-bottom-sheet-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
  transform-origin: bottom center;
}
.spark-veil {
  animation: spark-veil 420ms ease both;
}
.spark-page-in {
  animation: spark-page-in 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.spark-profile-swap-out {
  animation: spark-profile-swap-out 200ms ease both;
}
.spark-profile-swap-in {
  animation: spark-profile-swap-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
.spark-press {
  transition: filter 120ms ease, box-shadow 180ms ease;
}
.spark-press:active {
  filter: brightness(1.18);
  animation: spark-press-glow 320ms ease-out;
}
.spark-pulse-refresh-dim {
  filter: grayscale(1) brightness(0.74);
  opacity: 0.88;
  transition: filter 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 280ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}
.spark-pulse-top-bar-track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  overflow: hidden;
  z-index: 40;
  pointer-events: none;
}
.spark-pulse-top-bar-fill {
  height: 100%;
  width: 38%;
  border-radius: 2px;
  animation: spark-pulse-top-bar 0.95s ease-in-out infinite;
}
.spark-pulse-feed-spring {
  animation: spark-pulse-feed-spring 480ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
`;

/** Inject CSS keyframes used for web button + sheet motion. Safe to call more than once. */
export function ensureWebMotionCss(): void {
  if (Platform.OS !== 'web' || typeof document === 'undefined') {
    return;
  }
  if (document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = CSS;
  document.head.appendChild(style);
}

export function webClass(name: string): { className: string } | Record<string, never> {
  if (Platform.OS !== 'web') {
    return {};
  }
  return { className: name };
}
