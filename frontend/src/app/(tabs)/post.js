import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { uploadImage } from '../../utils/uploadImage';
import { Ionicons } from '@expo/vector-icons';
import FormInput from '../../components/FormInput';
import AppButton from '../../components/AppButton';
import Chip from '../../components/Chip';
import { api } from '../../api/client';
import { CATEGORIES, COLORS, PLACES } from '../../constants';

const WHEN = [
  { label: 'Today', days: 0 },
  { label: 'Yesterday', days: 1 },
  { label: '2-3 days ago', days: 3 },
  { label: 'Last week', days: 7 },
];

const emptyForm ={ type: 'lost', title: '', description: '', category: 'Other', location: '', days: 0 };

export default function PostScreen() {
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));
  const isLost = form.type === 'lost';

  const pickImage = async (fromCamera) => {
    const permission = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Please allow access to add a photo.');

    const options = { mediaTypes: ['images'], allowsEditing: true, quality: 0.6 };
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) setImage(result.assets[0]);
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.location.trim()) {
      return Alert.alert('Missing details', 'Please add a title and where it was ' + (isLost ? 'lost' : 'found'));
    }

    const data = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      location: form.location.trim(),
      date: new Date(Date.now() - form.days * 24 * 60 * 60 * 1000).toISOString(),
    };

    setLoading(true);
    try {
      if (image) {
        const uploaded = await uploadImage(image); // phone -> Cloudinary directly
        data.imageUrl = uploaded.url;
        data.imagePublicId = uploaded.publicId;
      }
      const { item } = await api.post('/items', data);
      setForm(emptyForm);
      setImage(null);
      Alert.alert('Posted!', 'All VJTI students have been notified.');
      router.push(`/item/${item._id}`);
    } catch (err) {
      Alert.alert('Could not post', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Lost / Found toggle */}
      <View style={styles.toggle}>
        {['lost', 'found'].map((t) => (
          <Pressable
            key={t}
            onPress={() => update('type')(t)}
            style={[
              styles.toggleBtn,
              form.type === t && { backgroundColor: t === 'lost' ? COLORS.lost : COLORS.found },
            ]}
          >
            <Text style={[styles.toggleText, form.type === t && { color: COLORS.white }]}>
              {t === 'lost' ? 'I lost something' : 'I found something'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Photo */}
      {image ? (
        <View>
          <Image source={{ uri: image.uri }} style={styles.preview} />
          <Pressable style={styles.removePhoto} onPress={() => setImage(null)}>
            <Ionicons name="close" size={18} color={COLORS.white} />
          </Pressable>
        </View>
      ) : (
        <View style={styles.photoRow}>
          <Pressable style={styles.photoBtn} onPress={() => pickImage(true)}>
            <Ionicons name="camera-outline" size={26} color={COLORS.primary} />
            <Text style={styles.photoText}>Take photo</Text>
          </Pressable>
          <Pressable style={styles.photoBtn} onPress={() => pickImage(false)}>
            <Ionicons name="images-outline" size={26} color={COLORS.primary} />
            <Text style={styles.photoText}>From gallery</Text>
          </Pressable>
        </View>
      )}

      <FormInput
        label="What is it? *"
        placeholder={isLost ? 'e.g. Black HP laptop charger' : 'e.g. Blue water bottle'}
        value={form.title}
        onChangeText={update('title')}
        maxLength={80}
      />

      <Text style={styles.label}>Category</Text>
      <View style={styles.wrap}>
        {CATEGORIES.map((c) => (
          <Chip key={c} label={c} selected={form.category === c} onPress={() => update('category')(c)} />
        ))}
      </View>

      <FormInput
        label={isLost ? 'Where did you lose it? *' : 'Where did you find it? *'}
        placeholder="e.g. Library 2nd floor"
        value={form.location}
        onChangeText={update('location')}
        maxLength={100}
      />
      <View style={[styles.wrap, { marginTop: -6 }]}>
        {PLACES.map((p) => (
          <Chip key={p} label={p} selected={form.location === p} onPress={() => update('location')(p)} />
        ))}
      </View>

      <Text style={styles.label}>When?</Text>
      <View style={styles.wrap}>
        {WHEN.map((w) => (
          <Chip key={w.label} label={w.label} selected={form.days === w.days} onPress={() => update('days')(w.days)} />
        ))}
      </View>

      <FormInput
        label="Description"
        placeholder={
          isLost
            ? 'Colour, brand, stickers, anything that helps identify it'
            : 'Where is it now? e.g. "Handed to library desk" (hide details only the owner would know)'
        }
        value={form.description}
        onChangeText={update('description')}
        multiline
        maxLength={1000}
        style={{ minHeight: 100, textAlignVertical: 'top' }}
      />

      <AppButton
        title={isLost ? 'Post Lost Item' : 'Post Found Item'}
        color={isLost ? COLORS.lost : COLORS.found}
        onPress={handleSubmit}
        loading={loading}
        style={{ marginTop: 8, marginBottom: 24 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  toggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 4,
    marginBottom: 16,
  },
  toggleBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  toggleText: { fontWeight: '700', color: COLORS.text },
  photoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  photoBtn: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  photoText: { color: COLORS.primary, marginTop: 6, fontWeight: '600' },
  preview: { width: '100%', height: 220, borderRadius: 12, marginBottom: 16 },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 6,
  },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
});
