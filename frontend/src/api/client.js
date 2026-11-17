import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

// Small fetch wrapper: adds the JWT token and turns errors into readable messages
async function request(path, { method = 'GET', body, form } = {}) {
  const token = await AsyncStorage.getItem('token');
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload;
  if (form) {
    payload = form; // FormData: fetch sets the multipart header itself
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await fetch(API_URL + path, { method, headers, body: payload });
  } catch (err) {
    console.log(`Request failed: ${method} ${API_URL}${path} ->`, err?.message);
    throw new Error(
      `Cannot reach the server (${API_URL}).\n\nCheck: backend is running, phone is on the same Wi-Fi, and the IP in frontend/.env is correct.`
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong');
    err.status = res.status;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  patch: (path, body) => request(path, { method: 'PATCH', body }),
  del: (path) => request(path, { method: 'DELETE' }),
  upload: (path, form) => request(path, { method: 'POST', form }),
};
