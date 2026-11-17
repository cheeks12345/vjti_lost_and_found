import Constants from 'expo-constants';

// Backend address comes from frontend/.env
//   EXPO_PUBLIC_API_URL  -> full URL (deployed backend), used first if set
//   EXPO_PUBLIC_API_IP   -> your PC's IP, or "auto" to detect it automatically
//   EXPO_PUBLIC_API_PORT -> backend port (default 5000)
// After editing .env, restart Expo with: npx expo start -c

const PORT = process.env.EXPO_PUBLIC_API_PORT || '5000';
let IP = (process.env.EXPO_PUBLIC_API_IP || '').trim();

if (!IP || IP.toLowerCase() === 'auto') {
  // The PC running Expo is the same PC running the backend
  IP = Constants.expoConfig?.hostUri?.split(':')[0] || 'localhost';
}

export const API_URL = process.env.EXPO_PUBLIC_API_URL || `http://${IP}:${PORT}/api`;

console.log('API URL:', API_URL);
