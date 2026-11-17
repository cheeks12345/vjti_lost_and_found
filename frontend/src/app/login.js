import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../components/FormInput';
import AppButton from '../components/AppButton';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Missing details', 'Enter your email and password');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Login failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logo}>
              <Ionicons name="search" size={40} color={COLORS.white} />
            </View>
            <Text style={styles.title}>VJTI Lost & Found</Text>
            <Text style={styles.subtitle}>Lost something on campus? Found something? Post it here.</Text>
          </View>

          <FormInput
            label="College Email"
            placeholder="yourname@vjti.ac.in"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <FormInput
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <AppButton title="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: 8 }} />

          <Text style={styles.footer}>
            New here?{' '}
            <Link href="/register" style={styles.link}>
              Create an account
            </Link>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: 14, color: COLORS.muted, textAlign: 'center', marginTop: 6 },
  footer: { textAlign: 'center', marginTop: 20, color: COLORS.muted, fontSize: 14 },
  link: { color: COLORS.primary, fontWeight: '700' },
});
