import { Pressable, StyleSheet, Text } from 'react-native';
import { COLORS } from '../constants';

export default function Chip({ label, selected, onPress, color = COLORS.primary }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, selected && { backgroundColor: color, borderColor: color }]}
    >
      <Text style={[styles.text, selected && { color: COLORS.white }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    marginRight: 8,
    marginBottom: 8,
  },
  text: { color: COLORS.text, fontSize: 14, fontWeight: '500' },
});
