/** Haptics disabled app-wide — visual press animations only, no sound or vibration. */
export type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'none';

export function triggerHaptic(_style: HapticStyle = 'none'): void {
  // Intentionally silent — Spark uses AnimatedPressable scale/opacity feedback only.
}
