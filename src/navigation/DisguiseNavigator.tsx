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
import { useTranslation } from '../i18n';
import { pulseBrand } from '../theme/pulseBrand';
import { disguiseWorldMeta } from '../utils/disguiseWorld';
import { resolveSparkSection } from '../types/preferences';

export type DisguiseTabParamList = {
  Home: { topic?: string } | undefined;
  Trending: undefined;
  Activity: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<DisguiseTabParamList>();

export function DisguiseNavigator() {
  const { colors } = useTheme();
  const { t, locale } = useTranslation();
  const { pulseSocial, preferences, user } = useApp();
  const meta = disguiseWorldMeta(preferences.sparkSection, user.gender, locale);
  const section = resolveSparkSection(preferences.sparkSection);
  const sectionAccent = section === 'ember' ? colors.ember : colors.gradientEnd;
  /** Pulse disguise tabs stay on-brand blue in Ember; Spark section keeps pink accent. */
  const tabActiveTint = section === 'ember' ? meta.accent : sectionAccent;
  const tabInactiveTint = section === 'ember' ? pulseBrand.navyMuted : colors.textMuted;
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
        tabBarActiveTintColor: tabActiveTint,
        tabBarInactiveTintColor: tabInactiveTint,
        tabBarBadgeStyle: {
          backgroundColor: tabActiveTint,
          color: '#FFFFFF',
          fontSize: 11,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof DisguiseTabParamList, keyof typeof Ionicons.glyphMap> = {
            Home: 'home',
            Trending: meta.trendingTab === 'Cosmos' ? 'planet-outline' : 'trending-up',
            Activity: 'notifications-outline',
            Profile: 'settings-outline',
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
        options={{ title: t('tabs.activity'), tabBarBadge: activityBadge }}
      />
      <Tab.Screen
        name="Profile"
        component={DisguiseProfileScreen}
        options={{ title: t('tabs.settings') }}
      />
    </Tab.Navigator>
  );
}
