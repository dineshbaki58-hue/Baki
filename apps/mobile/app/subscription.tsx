import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export default function Subscription() {
  return (
    <ScrollView className="flex-1 bg-black p-6">
      <Text className="text-white text-2xl font-bold mb-4">Subscription</Text>
      <View className="bg-zinc-900 rounded p-4 mb-3">
        <Text className="text-white font-bold mb-2">Free</Text>
        <Text className="text-gray-300 mb-2">Limited access</Text>
        <TouchableOpacity className="bg-brand p-3 rounded"><Text className="text-white text-center">Current</Text></TouchableOpacity>
      </View>
      <View className="bg-zinc-900 rounded p-4 mb-3">
        <Text className="text-white font-bold mb-2">Pro Monthly - $4.99</Text>
        <TouchableOpacity className="bg-brand p-3 rounded"><Text className="text-white text-center">Start 7-day trial</Text></TouchableOpacity>
      </View>
      <View className="bg-zinc-900 rounded p-4 mb-3">
        <Text className="text-white font-bold mb-2">Pro Yearly - $49.99</Text>
        <TouchableOpacity className="bg-brand p-3 rounded"><Text className="text-white text-center">Start 7-day trial</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}
