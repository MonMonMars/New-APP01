import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAdmin } from '../context/AdminContext';
import { useTheme } from '../context/ThemeContext';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminLoginScreen } from '../screens/admin/AdminLoginScreen';
import { AdminProfileEditScreen } from '../screens/admin/AdminProfileEditScreen';
import { AdminProfilesScreen } from '../screens/admin/AdminProfilesScreen';
import { AdminRolesScreen } from '../screens/admin/AdminRolesScreen';

export type AdminStackParamList = {
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminProfiles: undefined;
  AdminProfileEdit: { profileId: string };
  AdminRoles: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

type AdminNavigatorProps = {
  onClose: () => void;
};

export function AdminNavigator({ onClose }: AdminNavigatorProps) {
  const { adminSession, isAdminHydrated, hasPermission } = useAdmin();
  const { colors } = useTheme();

  if (!isAdminHydrated) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.gradientEnd} />
      </View>
    );
  }

  const initialRoute = adminSession && hasPermission('canAccessAdmin') ? 'AdminDashboard' : 'AdminLogin';

  return (
    <Stack.Navigator
      key={adminSession?.email ?? 'guest'}
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade_from_bottom',
      }}
    >
      <Stack.Screen name="AdminLogin">
        {() => <AdminLoginScreen onClose={onClose} />}
      </Stack.Screen>
      <Stack.Screen name="AdminDashboard">
        {({ navigation }) => (
          <AdminDashboardScreen onClose={onClose} navigation={navigation} />
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminProfiles">
        {({ navigation }) => <AdminProfilesScreen navigation={navigation} />}
      </Stack.Screen>
      <Stack.Screen name="AdminProfileEdit">
        {({ navigation, route }) => (
          <AdminProfileEditScreen profileId={route.params.profileId} navigation={navigation} />
        )}
      </Stack.Screen>
      <Stack.Screen name="AdminRoles">
        {({ navigation }) => <AdminRolesScreen navigation={navigation} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
