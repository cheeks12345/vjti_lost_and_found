import { useEffect } from 'react';
import { Stack, SplashScreen, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';

SplashScreen.preventAutoHideAsync();

// When a student taps a notification, open that item
function useNotificationTap(isLoggedIn) {
  useEffect(() => {
    if (!isLoggedIn) return;

    const openItem = (response) => {
      const itemId = response?.notification?.request?.content?.data?.itemId;
      if (itemId) router.push(`/item/${itemId}`);
    };

    // App was opened by tapping a notification
    const last = Notifications.getLastNotificationResponse();
    if (last) {
      setTimeout(() => openItem(last), 0);
      Notifications.clearLastNotificationResponseAsync().catch(() => {});
    }

    // Notification tapped while app is running
    const sub = Notifications.addNotificationResponseReceivedListener(openItem);
    return () => sub.remove();
  }, [isLoggedIn]);
}

function RootNavigator() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) SplashScreen.hide();
  }, [isLoading]);

  useNotificationTap(!!user);

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: COLORS.bg },
      }}
    >
      {/* Only for logged-in students */}
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="item/[id]" options={{ title: 'Item Details' }} />
      </Stack.Protected>

      {/* Only when logged out */}
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ title: 'Create Account' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <RootNavigator />
    </AuthProvider>
  );
}
