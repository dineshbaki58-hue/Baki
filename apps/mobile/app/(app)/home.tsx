import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0b1220' }} contentContainerStyle={{ padding: 24 }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '700', marginBottom: 16 }}>BakiFitness</Text>
      <Link href="/(app)/diet" asChild>
        <TouchableOpacity style={{ backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>AI Diet & Nutrition</Text>
          <Text style={{ color: '#9ca3af' }}>Generate a 7-day meal plan</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(app)/workouts" asChild>
        <TouchableOpacity style={{ backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Workout Library</Text>
          <Text style={{ color: '#9ca3af' }}>Browse training videos</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(app)/progress" asChild>
        <TouchableOpacity style={{ backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Daily Progress</Text>
          <Text style={{ color: '#9ca3af' }}>Track weight and macros</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/(app)/subscribe" asChild>
        <TouchableOpacity style={{ backgroundColor: '#22c55e', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' }}>
          <Text style={{ color: 'black', fontWeight: '800' }}>Go Premium</Text>
        </TouchableOpacity>
      </Link>
    </ScrollView>
  );
}
