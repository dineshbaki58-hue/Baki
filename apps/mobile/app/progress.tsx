import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function Progress() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    setItems([
      { id: 'p1', date: '2025-10-01', weightKg: 70.2 },
      { id: 'p2', date: '2025-10-05', weightKg: 69.9 },
    ]);
  }, []);
  return (
    <ScrollView className="flex-1 bg-black p-6">
      <Text className="text-white text-2xl font-bold mb-4">Progress</Text>
      {items.map((i) => (
        <View key={i.id} className="bg-zinc-900 rounded p-4 mb-3">
          <Text className="text-white">{i.date}</Text>
          <Text className="text-gray-300">Weight: {i.weightKg} kg</Text>
        </View>
      ))}
    </ScrollView>
  );
}
