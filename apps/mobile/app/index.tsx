import { Link } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';

export default function Home() {
  return (
    <View className="flex-1 bg-black items-center justify-center p-6">
      <Text className="text-white text-3xl font-bold mb-6">BakiFitness</Text>
      <View className="w-full gap-3">
        <Link href="/onboarding" asChild>
          <TouchableOpacity className="bg-brand p-4 rounded-lg"><Text className="text-white text-center">Onboarding</Text></TouchableOpacity>
        </Link>
        <Link href="/meals" asChild>
          <TouchableOpacity className="bg-brand p-4 rounded-lg"><Text className="text-white text-center">Meals</Text></TouchableOpacity>
        </Link>
        <Link href="/workouts" asChild>
          <TouchableOpacity className="bg-brand p-4 rounded-lg"><Text className="text-white text-center">Workouts</Text></TouchableOpacity>
        </Link>
        <Link href="/tracking" asChild>
          <TouchableOpacity className="bg-brand p-4 rounded-lg"><Text className="text-white text-center">Daily Tracking</Text></TouchableOpacity>
        </Link>
        <Link href="/progress" asChild>
          <TouchableOpacity className="bg-brand p-4 rounded-lg"><Text className="text-white text-center">Progress</Text></TouchableOpacity>
        </Link>
        <Link href="/subscription" asChild>
          <TouchableOpacity className="bg-brand p-4 rounded-lg"><Text className="text-white text-center">Subscription</Text></TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
