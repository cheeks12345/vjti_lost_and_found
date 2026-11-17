import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ItemCard from '../../components/ItemCard';
import Chip from '../../components/Chip';
import { api } from '../../api/client';
import { CATEGORIES, COLORS } from '../../constants';

const TYPES = [
  { key: 'all', label: 'All' },
  { key: 'lost', label: 'Lost', color: COLORS.lost },
  { key: 'found', label: 'Found', color: COLORS.found },
];

export default function HomeScreen() {
  const [type, setType] = useState('all');
  const [category, setCategory] = useState('');
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState(''); // debounced value

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const requestId = useRef(0); // ignore old responses when filters change quickly

  // Wait 400ms after typing stops before searching
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchText), 400);
    return () => clearTimeout(t);
  }, [searchText]);

  const loadItems = useCallback(
    async (pageNum = 1) => {
      const id = ++requestId.current;
      setLoading(true);
      setError('');
      try {
        let query = `?page=${pageNum}`;
        if (type !== 'all') query += `&type=${type}`;
        if (category) query += `&category=${encodeURIComponent(category)}`;
        if (search.trim()) query += `&search=${encodeURIComponent(search.trim())}`;

        const data = await api.get(`/items${query}`);
        if (id !== requestId.current) return;

        setItems((prev) => (pageNum === 1 ? data.items : [...prev, ...data.items]));
        setPage(data.page);
        setTotalPages(data.totalPages);
      } catch (err) {
        if (id === requestId.current) setError(err.message);
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [type, category, search]
  );

  // Reload when screen opens or filters change
  useFocusEffect(
    useCallback(() => {
      loadItems(1);
    }, [loadItems])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadItems(1);
  };

  const loadMore = () => {
    if (!loading && page < totalPages) loadItems(page + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color={COLORS.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search wallet, ID card, library..."
          placeholderTextColor={COLORS.muted}
          value={searchText}
          onChangeText={setSearchText}
          returnKeyType="search"
        />
        {searchText ? (
          <Ionicons name="close-circle" size={18} color={COLORS.muted} onPress={() => setSearchText('')} />
        ) : null}
      </View>

      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <Chip key={t.key} label={t.label} color={t.color} selected={type === t.key} onPress={() => setType(t.key)} />
        ))}
      </View>

      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>
          <Chip label="All categories" selected={!category} onPress={() => setCategory('')} />
          {CATEGORIES.map((c) => (
            <Chip key={c} label={c} selected={category === c} onPress={() => setCategory(c)} />
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ItemCard item={item} />}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListFooterComponent={loading && !refreshing ? <ActivityIndicator style={{ margin: 16 }} color={COLORS.primary} /> : null}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name={error ? 'cloud-offline-outline' : 'file-tray-outline'} size={48} color={COLORS.muted} />
              <Text style={styles.emptyText}>{error || 'No posts yet. Pull down to refresh.'}</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    margin: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 15, color: COLORS.text },
  typeRow: { flexDirection: 'row', paddingHorizontal: 12 },
  categoryRow: { paddingHorizontal: 12 },
  list: { padding: 12, paddingTop: 4, flexGrow: 1 },
  empty: { alignItems: 'center', marginTop: 60, paddingHorizontal: 24 },
  emptyText: { color: COLORS.muted, marginTop: 10, textAlign: 'center' },
});
