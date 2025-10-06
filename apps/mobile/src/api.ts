import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000';

let inMemoryToken: string | null = null;

export async function setToken(token: string) {
  inMemoryToken = token;
  try {
    await SecureStore.setItemAsync('auth_token', token);
  } catch {}
}

export async function clearToken() {
  inMemoryToken = null;
  try {
    await SecureStore.deleteItemAsync('auth_token');
  } catch {}
}

async function getToken(): Promise<string | null> {
  if (inMemoryToken) return inMemoryToken;
  try {
    const stored = await SecureStore.getItemAsync('auth_token');
    inMemoryToken = stored;
    return stored;
  } catch {
    return null;
  }
}

export const api = axios.create({ baseURL });

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});
