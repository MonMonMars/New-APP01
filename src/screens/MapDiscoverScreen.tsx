import { StyleSheet, View } from 'react-native';

import { ExpandSearchMap } from '../components/ExpandLocationSheet';

type MapDiscoverScreenProps = {
  onClose: () => void;
};

export function MapDiscoverScreen({ onClose }: MapDiscoverScreenProps) {
  return (
    <View style={styles.root}>
      <ExpandSearchMap onClose={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
