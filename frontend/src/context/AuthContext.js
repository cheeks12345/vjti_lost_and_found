import { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../api/client';
import { registerForPushNotifications } from '../utils/notifications';

const AuthContext = createContext(null);

// Get this phone's push token and save it on the server
async function enablePushNotifications() {
  const token = await registerForPushNotifications();
  if (token) {
    await api.put('/auth/push-token', { token }).catch(() => {});
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app start: if we have a saved token, load the user
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          const data = await api.get('/auth/me');
          setUser(data.user);
          enablePushNotifications();
        }
      } catch (err) {
        if (err.status === 401) await AsyncStorage.removeItem('token');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const saveSession = async (data) => {
    await AsyncStorage.setItem('token', data.token);
    setUser(data.user);
    enablePushNotifications();
  };

  const login = async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    await saveSession(data);
  };

  const register = async (form) => {
    const data = await api.post('/auth/register', form);
    await saveSession(data);
  };

  const logout = async () => {
    await api.del('/auth/push-token').catch(() => {}); // stop notifications on this phone
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
