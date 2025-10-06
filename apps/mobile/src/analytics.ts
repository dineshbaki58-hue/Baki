import * as SecureStore from 'expo-secure-store';
import { api } from './api';

async function getDistinctId(): Promise<string> {
  try {
    let id = await SecureStore.getItemAsync('distinct_id');
    if (!id) {
      id = `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await SecureStore.setItemAsync('distinct_id', id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

export async function track(event: string, properties?: Record<string, unknown>) {
  try {
    const distinctId = await getDistinctId();
    await api.post('/events', { event, distinctId, properties });
  } catch {}
}
