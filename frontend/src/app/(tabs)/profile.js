import { Alert, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AppButton from '../../components/AppButton';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You will stop getting notifications on this phone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>

        <View style={styles.row}>
          <Ionicons name="mail-outline" size={18} color={COLORS.muted} />
          <Text style={styles.detail}>{user?.email}</Text>
        </View>
        {user?.phone ? (
          <View style={styles.row}>
            <Ionicons name="call-outline" size={18} color={COLORS.muted} />
            <Text style={styles.detail}>{user.phone}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsTitle}>Safety tips</Text>
        <Text style={styles.tip}>• Meet in public places on campus (library, canteen).</Text>
        <Text style={styles.tip}>• Ask the owner to describe the item before handing it over.</Text>
        <Text style={styles.tip}>• Mark your post as resolved once the item is returned.</Text>
      </View>

      <AppButton title="Log Out" outline color={COLORS.lost} onPress={confirmLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: COLORS.bg },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: { color: COLORS.white, fontSize: 30, fontWeight: '800' },
  name: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  detail: { color: COLORS.muted, fontSize: 15 },
  tips: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  tipsTitle: { fontWeight: '700', fontSize: 16, marginBottom: 8, color: COLORS.text },
  tip: { color: COLORS.muted, marginBottom: 4, lineHeight: 20 },
});
