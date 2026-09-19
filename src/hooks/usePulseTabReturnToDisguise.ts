import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

import { useApp } from '../context/AppContext';
import { MainTabParamList } from '../types/navigation';

/**
 * When Discover (Pulse tab) is already focused, React Navigation does not fire tab
 * bar onPress again — listen for tabPress to return to Pulse disguise.
 */
export function usePulseTabReturnToDisguise() {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { setDisguiseMode } = useApp();

  useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (event) => {
      if (!navigation.isFocused()) {
        return;
      }
      event.preventDefault();
      void setDisguiseMode(true);
    });
    return unsubscribe;
  }, [navigation, setDisguiseMode]);
}
