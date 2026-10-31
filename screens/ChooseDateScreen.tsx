import React, { useState, useCallback } from 'react';
import { ActivityIndicator, AppState, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import CircleBookingSelector, { BookingSelection } from '../src/components/CircleBookingSelector';
import ActionButton from '../src/components/ActionButton';
import { getAvailableSlots, apiErrorMessage, Slot } from '../src/services/api';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseDate'>;
export default function ChooseDateScreen({ navigation }: Props) {
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [availability, setAvailability] = useState<{ key: string; slots: Slot[]; status: 'loading' | 'ready' | 'error'; error: string }>({ key: '', slots: [], status: 'ready', error: '' });
  const [retry, setRetry] = useState(0);
  const selectionKey = selection ? `${selection.date}/${selection.time}/${selection.duration}` : '';
  useFocusEffect(useCallback(() => {
    let active = true;
    let request = 0;
    if (!selection) { setAvailability({ key: '', slots: [], status: 'ready', error: '' }); return; }
    const load = () => {
      const current = ++request;
      setAvailability(previous => previous.key === selectionKey && previous.status === 'ready' ? previous : { key: selectionKey, slots: [], status: 'loading', error: '' });
      getAvailableSlots(selection.date, selection.time, selection.duration)
        .then(items => {
          if (!active || current !== request) return;
          setAvailability({ key: selectionKey, slots: items, status: 'ready', error: '' });
        })
        .catch(error => { if (active && current === request) { setAvailability({ key: selectionKey, slots: [], status: 'error', error: apiErrorMessage(error) }); } });
    };
    load();
    const timer = setInterval(() => { if (AppState.currentState === 'active') load(); }, 15000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') load(); });
    return () => { active = false; request++; clearInterval(timer); listener.remove(); };
  }, [selectionKey, retry]));
  const slots = availability.key === selectionKey ? availability.slots : [];
  const loading = !!selection && (availability.key !== selectionKey || availability.status === 'loading');
  const error = availability.key === selectionKey ? availability.error : '';
  const ready = Boolean(selection && slots.length > 0 && !loading && !error);
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
            {loading ? <View style={styles.status} accessibilityLiveRegion="polite">
              <ActivityIndicator color={colors.blue} />
              <Text style={styles.statusText}>Consultando espacios…</Text>
            </View> : error ? <Text accessibilityRole="alert" style={styles.errorText}>{error}</Text> : !selection ?
              <Text style={styles.statusText}>Elegí un turno con horarios disponibles.</Text> : !slots.length ?
                <Text accessibilityLiveRegion="polite" style={styles.errorText}>No hay disponibilidad para este turno.</Text> :
                <Text style={styles.statusText}>Hay disponibilidad para este turno.</Text>}
            {!!selection && !loading && (!!error || !slots.length) && <ActionButton surface="light" variant="secondary" label="Reintentar disponibilidad" onPress={() => setRetry(previous => previous + 1)} />}
          </View>

          <View style={styles.actions}>
            <ActionButton label={loading ? 'Consultando disponibilidad…' : 'Continuar'} surface="light" disabled={!ready} accessibilityHint="Completá los datos de tu reserva"
              onPress={() => { if (selection && ready) navigation.navigate('ReservationForm', { booking: { ...selection, espacio: 0, espacioLabel: undefined } }); }} />
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
