import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/AppButton';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants';
import { formatDate, timeAgo } from '../../utils/timeAgo';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .get(`/items/${id}`)
      .then((data) => setItem(data.item))
      .catch((err) => setError(err.message));
  }, [id]);

  if (error) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.muted} />
        <Text style={styles.muted}>{error}</Text>
      </View>
    );
  }
  if (!item) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const isLost = item.type === 'lost';
  const isOwner = item.postedBy?._id === user?._id;
  const poster = item.postedBy || {};

  const markResolved = () => {
    Alert.alert('Mark as resolved?', isLost ? 'Did you get your item back?' : 'Was the item returned to its owner?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes',
        onPress: async () => {
          setBusy(true);
          try {
            const data = await api.patch(`/items/${item._id}/resolve`);
            setItem({ ...item, status: data.item.status });
          } catch (err) {
            Alert.alert('Error', err.message);
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  };

  const deletePost = () => {
    Alert.alert('Delete post?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setBusy(true);
          try {
            await api.del(`/items/${item._id}`);
            router.back();
          } catch (err) {
            Alert.alert('Error', err.message);
            setBusy(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: COLORS.bg }} contentContainerStyle={styles.container}>
      {item.image?.url ? (
        <Image source={{ uri: item.image.url }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="image-outline" size={56} color={COLORS.muted} />
        </View>
      )}

      <View style={styles.badges}>
        <View style={[styles.badge, { backgroundColor: isLost ? COLORS.lost : COLORS.found }]}>
          <Text style={styles.badgeText}>{isLost ? 'LOST' : 'FOUND'}</Text>
        </View>
        {item.status === 'resolved' && (
          <View style={[styles.badge, { backgroundColor: COLORS.muted }]}>
            <Text style={styles.badgeText}>RESOLVED</Text>
          </View>
        )}
        <Text style={styles.muted}>Posted {timeAgo(item.createdAt)}</Text>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.card}>
        <InfoRow icon="pricetag-outline" label="Category" value={item.category} />
        <InfoRow icon="location-outline" label={isLost ? 'Lost at' : 'Found at'} value={item.location} />
        <InfoRow icon="calendar-outline" label="Date" value={formatDate(item.date)} />
      </View>

      {item.description ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Posted by</Text>
        <Text style={styles.posterName}>{isOwner ? 'You' : poster.name}</Text>
        {!isOwner && (
          <View style={styles.contactRow}>
            {poster.phone ? (
              <AppButton
                title="Call"
                style={styles.contactBtn}
                onPress={() => Linking.openURL(`tel:${poster.phone}`)}
              />
            ) : null}
            <AppButton
              title="Email"
              outline
              style={styles.contactBtn}
              onPress={() =>
                Linking.openURL(`mailto:${poster.email}?subject=${encodeURIComponent('VJTI Lost & Found: ' + item.title)}`)
              }
            />
          </View>
        )}
      </View>

      {isOwner && (
        <View style={{ gap: 10, marginTop: 4 }}>
          {item.status === 'open' && (
            <AppButton title="Mark as Resolved" color={COLORS.found} onPress={markResolved} loading={busy} />
          )}
          <AppButton title="Delete Post" outline color={COLORS.lost} onPress={deletePost} loading={busy} />
        </View>
      )}
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  image: { width: '100%', height: 260, borderRadius: 16, marginBottom: 14 },
  placeholder: { backgroundColor: COLORS.white, alignItems: 'center', justifyContent: 'center' },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  badgeText: { color: COLORS.white, fontWeight: '700', fontSize: 12 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  infoLabel: { color: COLORS.muted, width: 80 },
  infoValue: { color: COLORS.text, fontWeight: '600', flex: 1 },
  sectionTitle: { fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  description: { color: COLORS.text, lineHeight: 21 },
  posterName: { fontSize: 16, color: COLORS.text },
  contactRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  contactBtn: { flex: 1 },
  muted: { color: COLORS.muted },
});
