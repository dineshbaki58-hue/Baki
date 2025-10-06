import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { setToken } from '../../src/api';
import { track } from '../../src/analytics';
import { Link, useRouter } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit() {
    setError('');
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/auth/login`, { email, password });
      const token = res.data.token as string;
      if (token) {
        await setToken(token);
        track('login_success');
        router.replace('/(app)/home');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Login failed');
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#0b1220', justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 16 }}>Welcome to BakiFitness</Text>
      {!!error && <Text style={{ color: 'tomato', marginBottom: 8 }}>{error}</Text>}
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Email" placeholderTextColor="#6b7280" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Password" placeholderTextColor="#6b7280" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity onPress={onSubmit} style={{ backgroundColor: '#22c55e', padding: 14, borderRadius: 10, alignItems: 'center' }}>
        <Text style={{ color: 'black', fontWeight: '700' }}>Sign in</Text>
      </TouchableOpacity>
      <Link href="/(auth)/register" style={{ color: '#93c5fd', marginTop: 12 }}>Create account</Link>
    </View>
  );
}
