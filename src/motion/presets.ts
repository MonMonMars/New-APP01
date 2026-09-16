/** Shared motion tokens — springs, durations, stagger steps. */
export const MOTION = {
  duration: {
    fast: 140,
    normal: 260,
    slow: 380,
    backdrop: 220,
    exit: 200,
  },
  spring: {
    press: { damping: 12, stiffness: 480, mass: 0.48 },
    pop: { damping: 12, stiffness: 380, mass: 0.58 },
    sheet: { damping: 22, stiffness: 280, mass: 0.85 },
    gentle: { damping: 20, stiffness: 260, mass: 0.7 },
    bounce: { damping: 11, stiffness: 380, mass: 0.55 },
    tab: { damping: 24, stiffness: 300, mass: 0.8 },
  },
  stagger: {
    step: 45,
    max: 360,
  },
} as const;

export function staggerDelay(index: number): number {
  return Math.min(index * MOTION.stagger.step, MOTION.stagger.max);
}
