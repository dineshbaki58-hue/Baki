import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';

export default function Onboarding() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [success, setSuccess] = useState('');

  async function onSave() {
    setSuccess('');
    await axios.put(`${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000'}/user/profile`, {
      heightCm: height ? Number(height) : undefined,
      weightKg: weight ? Number(weight) : undefined,
      goal: goal || undefined,
    }, { headers: { Authorization: `Bearer TOKEN_PLACEHOLDER` }});
    setSuccess('Saved');
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#0b1220' }}>
      {!!success && <Text style={{ color: '#22c55e' }}>{success}</Text>}
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Tell us about you</Text>
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Height (cm)" placeholderTextColor="#6b7280" value={height} onChangeText={setHeight} keyboardType="numeric" />
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Weight (kg)" placeholderTextColor="#6b7280" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Goal" placeholderTextColor="#6b7280" value={goal} onChangeText={setGoal} />
      <TouchableOpacity onPress={onSave} style={{ backgroundColor: '#22c55e', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: 'black', fontWeight: '700' }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}
