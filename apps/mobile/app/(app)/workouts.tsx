import { useEffect, useState } from 'react';
import { View, Text, Image, FlatList } from 'react-native';
import axios from 'axios';
import { api } from '../../src/api';
import { track } from '../../src/analytics';

export default function Workouts() {
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    api.get(`/workouts`).then(r => {
      setVideos(r.data.videos || []);
      track('workouts_listed', { count: r.data.videos?.length || 0 });
    }).catch(() => setVideos([]));
  }, []);

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: '#0b1220' }}
      contentContainerStyle={{ padding: 16 }}
      data={videos}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={{ backgroundColor: '#111827', borderRadius: 12, marginBottom: 12, overflow: 'hidden' }}>
          <Image source={{ uri: item.thumbnailUrl }} style={{ width: '100%', height: 180 }} />
          <View style={{ padding: 12 }}>
            <Text style={{ color: 'white', fontWeight: '700' }}>{item.title}</Text>
            <Text style={{ color: '#9ca3af' }}>{item.description}</Text>
          </View>
        </View>
      )}
    />
  );
}
