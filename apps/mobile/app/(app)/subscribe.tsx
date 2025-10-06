import { View, Text, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { api } from '../../src/api';
import { track } from '../../src/analytics';

export default function Subscribe() {
  async function onSubscribe() {
    const res = await api.post(`/stripe/checkout`, {});
    const url = res.data.url as string;
    if (url) {
      // For web, window.open; on native, use WebBrowser
      if (typeof window !== 'undefined') window.location.href = url;
      track('checkout_started');
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#0b1220', justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Go Premium</Text>
      <TouchableOpacity onPress={onSubscribe} style={{ backgroundColor: '#22c55e', padding: 14, borderRadius: 10, alignItems: 'center' }}>
        <Text style={{ color: 'black', fontWeight: '700' }}>Subscribe</Text>
      </TouchableOpacity>
    </View>
  );
}
