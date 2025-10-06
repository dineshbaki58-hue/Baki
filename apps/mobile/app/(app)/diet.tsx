import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import { api } from '../../src/api';
import { track } from '../../src/analytics';

export default function Diet() {
  const [goal, setGoal] = useState('fat loss');
  const [calories, setCalories] = useState('');
  const [plan, setPlan] = useState<any>(null);
  const [error, setError] = useState('');

  async function onGenerate() {
    setError('');
    try {
      const res = await api.post(`/ai/diet`, {
        goal,
        calories: calories ? Number(calories) : undefined,
      });
      setPlan(res.data.plan);
      track('diet_generated', { goal, calories });
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to generate');
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0b1220' }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>AI Diet & Nutrition</Text>
      {!!error && <Text style={{ color: 'tomato', marginBottom: 8 }}>{error}</Text>}
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Goal" placeholderTextColor="#6b7280" value={goal} onChangeText={setGoal} />
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Calories (optional)" placeholderTextColor="#6b7280" value={calories} onChangeText={setCalories} keyboardType="numeric" />
      <TouchableOpacity onPress={onGenerate} style={{ backgroundColor: '#22c55e', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: 'black', fontWeight: '700' }}>Generate Plan</Text>
      </TouchableOpacity>
      {plan && (
        <View style={{ backgroundColor: '#111827', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: 'white', fontWeight: '700', marginBottom: 8 }}>Plan</Text>
          <Text style={{ color: '#9ca3af' }}>{JSON.stringify(plan, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}
