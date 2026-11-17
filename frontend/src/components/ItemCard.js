import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants';
import { timeAgo } from '../utils/timeAgo';

export default function ItemCard({ item }) {
  const isLost = item.type === 'lost';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}
      onPress={() => router.push(`/item/${item._id}`)}
    >
      {item.image?.url ? (
        <Image source={{ uri: item.image.url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="image-outline" size={28} color={COLORS.muted} />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.row}>
          <View style={[styles.badge, { backgroundColor: isLost ? COLORS.lost : COLORS.found }]}>
            <Text style={styles.badgeText}>{isLost ? 'LOST' : 'FOUND'}</Text>
          </View>
          {item.status === 'resolved' && (
            <View style={[styles.badge, { backgroundColor: COLORS.muted }]}>
              <Text style={styles.badgeText}>RESOLVED</Text>
            </View>
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={COLORS.muted} />
          <Text style={styles.meta} numberOfLines={1}>{item.location}</Text>
        </View>

        <Text style={styles.meta}>
          {item.category} · {timeAgo(item.createdAt)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  image: { width: 84, height: 84, borderRadius: 10 },
  placeholder: { backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 4 },
  badgeText: { color: COLORS.white, fontSize: 11, fontWeight: '700' },
  title: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  meta: { fontSize: 13, color: COLORS.muted, flexShrink: 1 },
});
