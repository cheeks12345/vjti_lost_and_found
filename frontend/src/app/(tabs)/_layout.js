import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants';

const icon = (name) => ({ color, size }) => <Ionicons name={name} color={color} size={size} />;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'VJTI Lost & Found', tabBarLabel: 'Home', tabBarIcon: icon('home') }}
      />
      <Tabs.Screen
        name="post"
        options={{ title: 'New Post', tabBarLabel: 'Post', tabBarIcon: icon('add-circle') }}
      />
      <Tabs.Screen
        name="my-posts"
        options={{ title: 'My Posts', tabBarIcon: icon('list') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: icon('person') }}
      />
    </Tabs>
  );
}
