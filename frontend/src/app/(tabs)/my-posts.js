import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ItemCard from '../../components/ItemCard';
import { api } from '../../api/client';
import { COLORS } from '../../constants';

export default function MyPostsScreen() {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await api.get('/items/mine');
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <FlatList
      style={{ backgroundColor: COLORS.bg }}
      contentContainerStyle={styles.list}
      data={items}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <ItemCard item={item} />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            load();
          }}
          colors={[COLORS.primary]}
        />
      }
      ListEmptyComponent={
        <View style={styles.empty}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.muted} />
          <Text style={styles.emptyText}>{error || "You haven't posted anything yet."}</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, flexGrow: 1 },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 24 },
  emptyText: { color: COLORS.muted, marginTop: 10, textAlign: 'center' },
});
