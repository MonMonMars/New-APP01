import { ViewStyle } from 'react-native';

import { useApp } from '../../context/AppContext';
import { disguiseWorldMeta } from '../../utils/disguiseWorld';
import { HarborBrand, HarborBrandMark } from './HarborBrandMark';
import { PulseBrand, PulseBrandMark } from './PulseBrandMark';

type DisguiseBrandProps = {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  style?: ViewStyle;
};

/** Pulse (Spark) or Harbor (Ember) masthead — never both. */
export function DisguiseBrand({ size = 'md', showTagline = false, style }: DisguiseBrandProps) {
  const { preferences } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection);
  switch (meta.world) {
    case 'harbor':
      return <HarborBrand size={size} showTagline={showTagline} style={style} />;
    case 'pulse':
      return <PulseBrand size={size} showTagline={showTagline} style={style} />;
    default: {
      const _exhaustive: never = meta.world;
      return _exhaustive;
    }
  }
}

export function DisguiseBrandMark({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const { preferences } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection);
  switch (meta.world) {
    case 'harbor':
      return <HarborBrandMark size={size} />;
    case 'pulse':
      return <PulseBrandMark size={size} />;
    default: {
      const _exhaustive: never = meta.world;
      return _exhaustive;
    }
  }
}
