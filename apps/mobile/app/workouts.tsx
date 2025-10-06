import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';

export default function Workouts() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  useEffect(() => {
    setWorkouts([
      { id: 'w1', title: 'Bench Press', durationMin: 10 },
      { id: 'w2', title: 'Squat', durationMin: 12 },
    ]);
  }, []);
  return (
    <ScrollView className="flex-1 bg-black p-6">
      <Text className="text-white text-2xl font-bold mb-4">Workouts</Text>
      {workouts.map((w) => (
        <View key={w.id} className="bg-zinc-900 rounded p-4 mb-3">
          <Text className="text-white">{w.title}</Text>
          <Text className="text-gray-300">{w.durationMin} min</Text>
        </View>
      ))}
    </ScrollView>
  );
}
