import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import CircleBookingSelector, { BookingSelection } from '../src/components/CircleBookingSelector';
import ActionButton from '../src/components/ActionButton';
import SpaceDropdown from '../src/components/SpaceDropdown';
import { getAvailableSlots, apiErrorMessage, Slot } from '../src/services/api';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseDate'>;
export default function ChooseDateScreen({ navigation }: Props) {
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [availability, setAvailability] = useState<{ key: string; slots: Slot[]; status: 'loading' | 'ready' | 'error'; error: string }>({ key: '', slots: [], status: 'ready', error: '' });
  const [slotId, setSlotId] = useState<number | null>(null);
  const selectionKey = selection ? `${selection.date}/${selection.time}/${selection.duration}` : '';
  useEffect(() => {
    let active = true;
    if (!selection) { setAvailability({ key: '', slots: [], status: 'ready', error: '' }); setSlotId(null); return; }
    setAvailability({ key: selectionKey, slots: [], status: 'loading', error: '' });
    getAvailableSlots(selection.date, selection.time, selection.duration)
      .then(items => {
        if (!active) return;
        setSlotId(previous => items.some(item => item.id === previous) ? previous : items[0]?.id ?? null);
        setAvailability({ key: selectionKey, slots: items, status: 'ready', error: '' });
      })
      .catch(error => { if (active) { setSlotId(null); setAvailability({ key: selectionKey, slots: [], status: 'error', error: apiErrorMessage(error) }); } });
    return () => { active = false; };
  }, [selectionKey]);
  const slots = availability.key === selectionKey ? availability.slots : [];
  const loading = !!selection && (availability.key !== selectionKey || availability.status === 'loading');
  const error = availability.key === selectionKey ? availability.error : '';
  const selectedSlot = slots.find(slot => slot.id === slotId);
  const ready = Boolean(selection && selectedSlot && !loading && !error);
  const insets = useSafeAreaInsets();
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver" onPress={() => navigation.goBack()}
        android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }} style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}>
        <Text style={styles.backArrow} accessible={false}>‹</Text>
      </Pressable>
      <Text style={styles.headerTitle} accessibilityRole="header">Reservá tu lugar</Text>
    </View>
    <View style={styles.sheet}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} nestedScrollEnabled>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">Elegí tu turno</Text>
            <Text style={styles.description}>Seleccioná el día, la hora y la duración.</Text>
            <View style={styles.turnPicker}><CircleBookingSelector onChange={setSelection} defaultDuration={60} /></View>
          </View>

          <View style={styles.spaceCard}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle} accessibilityRole="header">Elegí tu espacio</Text>
              <Text style={styles.description}>Seleccioná dónde querés realizar el lavado.</Text>
            </View>
            {loading ? <View style={styles.status} accessibilityLiveRegion="polite">
              <ActivityIndicator color={colors.blue} />
              <Text style={styles.statusText}>Consultando espacios…</Text>
            </View> : error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : !selection ?
              <Text style={styles.statusText}>Elegí un turno con horarios disponibles.</Text> : !slots.length ?
                <Text style={styles.statusText}>No hay espacios disponibles para este turno. Probá con otro horario.</Text> :
                <SpaceDropdown slots={slots} value={slotId} onChange={setSlotId} />}
          </View>

          <View style={styles.actions}>
            <ActionButton label={loading ? 'Consultando disponibilidad…' : 'Continuar'} surface="light" disabled={!ready} accessibilityHint="Completá los datos de tu reserva"
              onPress={() => { if (selection && ready && slotId !== null) navigation.navigate('ReservationForm', { booking: { ...selection, espacio: slotId, espacioLabel: selectedSlot?.label } }); }} />
          </View>
        </View>
      </ScrollView>
    </View>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blue },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
  backButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  backArrow: { fontSize: 36, lineHeight: 40, color: '#FFFFFF', marginTop: -3 },
  headerTitle: { flex: 1, fontSize: 26, lineHeight: 34, fontWeight: '700', color: '#FFFFFF' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32, alignItems: 'center' },
  content: { width: '100%', maxWidth: 480, gap: 28 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 20, lineHeight: 28, fontWeight: '700', color: colors.ink },
  description: { fontSize: 15, lineHeight: 22, color: colors.label },
  turnPicker: { marginTop: 12 },
  spaceCard: { backgroundColor: '#F0F4FC', borderRadius: 24, borderWidth: 1, borderColor: '#E0E8F7', padding: 20, gap: 20 },
  status: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 8 },
  statusText: { flexShrink: 1, fontSize: 15, lineHeight: 23, color: colors.label },
  errorText: { fontSize: 15, lineHeight: 23, color: '#A92330' },
  actions: { alignItems: 'center', paddingTop: 4 },
  pressed: { opacity: 0.8 },
});
