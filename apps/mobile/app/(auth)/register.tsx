import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { setToken } from '../../src/api';
import { track } from '../../src/analytics';
import { useRouter } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function onSubmit() {
    setError('');
    try {
      const res = await axios.post(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/auth/register`, { email, password, name });
      const token = res.data.token as string;
      if (token) {
        await setToken(token);
        track('register_success');
        router.replace('/(app)/home');
      }
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Registration failed');
    }
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#0b1220', justifyContent: 'center' }}>
      <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 16 }}>Create your account</Text>
      {!!error && <Text style={{ color: 'tomato', marginBottom: 8 }}>{error}</Text>}
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Name" placeholderTextColor="#6b7280" value={name} onChangeText={setName} />
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Email" placeholderTextColor="#6b7280" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Password" placeholderTextColor="#6b7280" secureTextEntry value={password} onChangeText={setPassword} />
      <TouchableOpacity onPress={onSubmit} style={{ backgroundColor: '#22c55e', padding: 14, borderRadius: 10, alignItems: 'center' }}>
        <Text style={{ color: 'black', fontWeight: '700' }}>Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}
