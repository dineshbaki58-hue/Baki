import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function Meals() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      // call API here in real app
      setPlans([{ id: '1', planType: 'daily', macros: { protein: 140, carbs: 200, fat: 60 }, meals: [] }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {}, []);

  return (
    <ScrollView className="flex-1 bg-black p-6">
      <Text className="text-white text-2xl font-bold mb-4">AI Meal Plans</Text>
      <TouchableOpacity disabled={loading} onPress={generate} className="bg-brand p-4 rounded mb-4">
        <Text className="text-white text-center">{loading ? 'Generating...' : 'Generate Plan'}</Text>
      </TouchableOpacity>
      {plans.map((p) => (
        <View key={p.id} className="bg-zinc-900 rounded p-4 mb-3">
          <Text className="text-white">Type: {p.planType}</Text>
          <Text className="text-white">Protein: {p.macros.protein}g</Text>
        </View>
      ))}
    </ScrollView>
  );
}
