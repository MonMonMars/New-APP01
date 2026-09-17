import { Image, ImageSourcePropType, ImageStyle, Platform, StyleProp, StyleSheet } from 'react-native';

export type BrandMarkWorld = 'spark' | 'ember' | 'pulse' | 'harbor';

type BrandMarkSize = 'sm' | 'md' | 'lg';

type BrandMarkProps = {
  world: BrandMarkWorld;
  size?: BrandMarkSize | number;
  /** Dim grey treatment for disguise header taps — one mark, no wordmark. */
  muted?: boolean;
  style?: StyleProp<ImageStyle>;
};

const SIZE_PX: Record<BrandMarkSize, number> = {
  sm: 28,
  md: 34,
  lg: 40,
};

const SOURCES: Record<BrandMarkWorld, ImageSourcePropType> = {
  spark: require('../../../assets/brand/spark-s5.png'),
  ember: require('../../../assets/brand/ember-e1e.png'),
  pulse: require('../../../assets/brand/pulse-p3.png'),
  harbor: require('../../../assets/brand/harbor-h.png'),
};

const LABELS: Record<BrandMarkWorld, string> = {
  spark: 'Spark',
  ember: 'Ember',
  pulse: 'Pulse',
  harbor: 'Harbor',
};

function markSize(size: BrandMarkSize | number): number {
  return typeof size === 'number' ? size : SIZE_PX[size];
}

/** Locked lettermarks: Pulse P3, Spark S5, Ember E1e, Harbor H on E1e gold. */
export function BrandMark({ world, size = 'md', muted = false, style }: BrandMarkProps) {
  const px = markSize(size);

  return (
    <Image
      accessibilityRole="image"
      accessibilityLabel={LABELS[world]}
      source={SOURCES[world]}
      resizeMode="contain"
      style={[
        styles.mark,
        { width: px, height: px },
        muted && styles.muted,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  mark: {
    overflow: 'hidden',
  },
  muted: Platform.select({
    web: {
      opacity: 0.48,
      filter: 'grayscale(1) brightness(0.92)',
    },
    default: {
      opacity: 0.42,
    },
  }),
});
