import { useApp } from '../context/AppContext';
import { resolveSparkSection, SparkSection } from '../types/preferences';

/**
 * Spark vs Ember pool for Pulse disguise content (feed profiles, reporter links, filters).
 * Snapshotted when entering disguise; refreshed when leaving dating via Pulse tab.
 */
export function usePulseContextSection(): SparkSection {
  const { pulseContextSection, preferences } = useApp();
  return pulseContextSection ?? resolveSparkSection(preferences.sparkSection);
}
