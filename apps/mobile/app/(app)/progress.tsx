import { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { api } from '../../src/api';
import { track } from '../../src/analytics';

export default function Progress() {
  const [weight, setWeight] = useState('');
  const [calories, setCalories] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.get(`/progress/today`).then(r => {
      const e = r.data.entry;
      if (e?.weightKg) setWeight(String(e.weightKg));
      if (e?.calories) setCalories(String(e.calories));
    }).catch(() => {});
  }, []);

  async function onSave() {
    setSuccess('');
    await api.post(`/progress/upsert`, {
      weightKg: weight ? Number(weight) : undefined,
      calories: calories ? Number(calories) : undefined,
    });
    setSuccess('Saved');
    track('progress_saved');
  }

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#0b1220' }}>
      {!!success && <Text style={{ color: '#22c55e' }}>{success}</Text>}
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Daily Progress</Text>
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Weight (kg)" placeholderTextColor="#6b7280" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <TextInput style={{ backgroundColor: '#111827', color: 'white', padding: 12, borderRadius: 8, marginBottom: 12 }} placeholder="Calories" placeholderTextColor="#6b7280" value={calories} onChangeText={setCalories} keyboardType="numeric" />
      <TouchableOpacity onPress={onSave} style={{ backgroundColor: '#22c55e', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 16 }}>
        <Text style={{ color: 'black', fontWeight: '700' }}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}
