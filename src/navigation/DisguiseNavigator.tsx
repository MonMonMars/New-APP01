import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TabBarButton } from '../components/TabBarButton';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { disguiseAlerts } from '../data/disguiseFeed';
import { DisguiseAlertsScreen } from '../screens/disguise/DisguiseAlertsScreen';
import { DisguiseFeedScreen } from '../screens/disguise/DisguiseFeedScreen';
import { DisguiseProfileScreen } from '../screens/disguise/DisguiseProfileScreen';
import { DisguiseTrendingScreen } from '../screens/disguise/DisguiseTrendingScreen';
import { disguiseWorldMeta } from '../utils/disguiseWorld';

export type DisguiseTabParamList = {
  Home: { topic?: string } | undefined;
  Trending: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<DisguiseTabParamList>();

export function DisguiseNavigator() {
  const { colors } = useTheme();
  const { pulseSocial, preferences } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection);
  const activityBadge =
    !pulseSocial.activityAlertsRead && disguiseAlerts.length > 0
      ? disguiseAlerts.length
      : undefined;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'fade',
        animationDuration: 220,
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 6,
          height: 72,
        },
        tabBarActiveTintColor: meta.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof DisguiseTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: meta.world === 'harbor' ? 'briefcase' : 'home',
            Trending: meta.world === 'harbor' ? 'bar-chart' : 'trending-up',
            Activity: 'notifications-outline',
            Profile: 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DisguiseFeedScreen} options={{ title: meta.homeTab }} />
      <Tab.Screen name="Trending" component={DisguiseTrendingScreen} options={{ title: meta.trendingTab }} />
      <Tab.Screen
        name="Activity"
        component={DisguiseAlertsScreen}
        options={{ tabBarBadge: activityBadge }}
      />
      <Tab.Screen name="Profile" component={DisguiseProfileScreen} />
    </Tab.Navigator>
  );
}
