import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { DisguiseTabParamList } from '../navigation/DisguiseNavigator';

/** Navigate to Home feed with an optional topic filter — clears stale params when topic is omitted. */
export function navigateDisguiseFeedTopic(
  navigation: BottomTabNavigationProp<DisguiseTabParamList>,
  topic?: string,
): void {
  if (topic) {
    navigation.navigate('Home', { topic });
    return;
  }

  navigation.navigate({
    name: 'Home',
    params: { topic: undefined },
    merge: true,
  });
}
