import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { api } from '../../src/api';

export default function Admin() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    api.get(`/admin/overview`).then(r => setOverview(r.data)).catch(() => setOverview(null));
  }, []);

  return (
    <View style={{ flex: 1, padding: 24, backgroundColor: '#0b1220' }}>
      <Text style={{ color: 'white', fontSize: 22, fontWeight: '700', marginBottom: 12 }}>Admin Overview</Text>
      {overview && (
        <FlatList
          data={Object.entries(overview)}
          keyExtractor={(i) => String(i[0])}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#111827', padding: 12, borderRadius: 8, marginBottom: 8 }}>
              <Text style={{ color: 'white' }}>{item[0]}: {String(item[1])}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
