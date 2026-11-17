import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text } from 'react-native';
import FormInput from '../components/FormInput';
import AppButton from '../components/AppButton';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) {
      return Alert.alert('Missing details', 'Name, email and password are required');
    }
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Sign up failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.note}>Use your VJTI email so only students can join.</Text>

        <FormInput label="Full Name" placeholder="e.g. Rahul Patil" value={form.name} onChangeText={update('name')} />
        <FormInput
          label="College Email"
          placeholder="yourname@vjti.ac.in"
          value={form.email}
          onChangeText={update('email')}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <FormInput
          label="Phone (optional)"
          placeholder="Shown on your posts so people can call you"
          value={form.phone}
          onChangeText={update('phone')}
          keyboardType="phone-pad"
          maxLength={15}
        />
        <FormInput
          label="Password"
          placeholder="At least 6 characters"
          value={form.password}
          onChangeText={update('password')}
          secureTextEntry
        />

        <AppButton title="Create Account" onPress={handleRegister} loading={loading} style={{ marginTop: 8 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24 },
  note: { color: COLORS.muted, marginBottom: 20, fontSize: 14 },
});
