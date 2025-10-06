import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function Onboarding() {
  const [form, setForm] = useState({ age: '', gender: 'male', heightCm: '', weightKg: '', activityLevel: 'moderate', goal: 'recomp', allergies: '', dietType: '' });

  return (
    <ScrollView className="flex-1 bg-black p-6">
      <Text className="text-white text-2xl font-bold mb-4">Onboarding</Text>
      {[
        ['age', 'Age'],
        ['gender', 'Gender (male/female)'],
        ['heightCm', 'Height cm'],
        ['weightKg', 'Weight kg'],
        ['activityLevel', 'Activity (sedentary/light/moderate/active/very_active)'],
        ['goal', 'Goal (loss/maintain/gain)'],
        ['allergies', 'Allergies (comma separated)'],
        ['dietType', 'Diet type (keto/vegan/etc)'],
      ].map(([key, label]) => (
        <View key={key} className="mb-3">
          <Text className="text-gray-300 mb-1">{label}</Text>
          <TextInput
            value={(form as any)[key]}
            onChangeText={(t) => setForm((f) => ({ ...f, [key]: t }))}
            placeholder={String(label)}
            placeholderTextColor="#888"
            className="bg-zinc-900 text-white p-3 rounded"
          />
        </View>
      ))}
      <TouchableOpacity className="bg-brand p-4 rounded"><Text className="text-white text-center">Save</Text></TouchableOpacity>
    </ScrollView>
  );
}
