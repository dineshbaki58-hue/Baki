import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';

export default function Tracking() {
  const [water, setWater] = useState('0');
  const [steps, setSteps] = useState('0');

  return (
    <ScrollView className="flex-1 bg-black p-6">
      <Text className="text-white text-2xl font-bold mb-4">Daily Tracking</Text>
      <View className="mb-3">
        <Text className="text-gray-300 mb-1">Water (ml)</Text>
        <TextInput value={water} onChangeText={setWater} keyboardType="numeric" className="bg-zinc-900 text-white p-3 rounded" />
      </View>
      <View className="mb-3">
        <Text className="text-gray-300 mb-1">Steps</Text>
        <TextInput value={steps} onChangeText={setSteps} keyboardType="numeric" className="bg-zinc-900 text-white p-3 rounded" />
      </View>
      <TouchableOpacity className="bg-brand p-4 rounded"><Text className="text-white text-center">Save</Text></TouchableOpacity>
    </ScrollView>
  );
}
