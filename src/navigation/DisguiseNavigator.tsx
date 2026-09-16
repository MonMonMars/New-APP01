import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { TabBarButton } from '../components/TabBarButton';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { pulseBrand } from '../theme/pulseBrand';
import { disguiseAlerts } from '../data/disguiseFeed';
import { DisguiseAlertsScreen } from '../screens/disguise/DisguiseAlertsScreen';
import { DisguiseFeedScreen } from '../screens/disguise/DisguiseFeedScreen';
import { DisguiseProfileScreen } from '../screens/disguise/DisguiseProfileScreen';
import { DisguiseTrendingScreen } from '../screens/disguise/DisguiseTrendingScreen';

export type DisguiseTabParamList = {
  Home: { topic?: string } | undefined;
  Trending: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<DisguiseTabParamList>();

export function DisguiseNavigator() {
  const { colors } = useTheme();
  const { pulseSocial } = useApp();
  const activityBadge =
    !pulseSocial.activityAlertsRead && disguiseAlerts.length > 0
      ? disguiseAlerts.length
      : undefined;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        animation: 'fade',
        tabBarButton: (props) => <TabBarButton {...props} />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 6,
          height: 72,
        },
        tabBarActiveTintColor: pulseBrand.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof DisguiseTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Trending: 'trending-up',
            Activity: 'notifications-outline',
            Profile: 'person-circle-outline',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DisguiseFeedScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Trending" component={DisguiseTrendingScreen} />
      <Tab.Screen
        name="Activity"
        component={DisguiseAlertsScreen}
        options={{ tabBarBadge: activityBadge }}
      />
      <Tab.Screen name="Profile" component={DisguiseProfileScreen} />
    </Tab.Navigator>
  );
}
