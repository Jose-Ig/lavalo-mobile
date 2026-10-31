import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import ActionButton from '../src/components/ActionButton';
import CircleBookingSelector, { type BookingSelection } from '../src/components/CircleBookingSelector';
import SpaceDropdown from '../src/components/SpaceDropdown';
import { useReservationAccess } from '../src/context/ReservationAccessContext';
import { getRescheduleSlots, rescheduleReservation, rescheduleError, type Slot } from '../src/services/api';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangeTurn'>;
export default function ChangeTurnScreen({ navigation }: Props) {
  const { access, setAccess } = useReservationAccess();
  const insets = useSafeAreaInsets();
  const initial = access ? {
    date: access.reservation.reservation_date,
    time: new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Cordoba', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(access.reservation.start_time)),
    duration: access.reservation.duration_minutes, espacio: access.reservation.slot_id,
  } : undefined;
  const [selection, setSelection] = useState<BookingSelection | null>(initial || null);
  const [space, setSpace] = useState<number | null>(initial?.espacio || null);
  const [availability, setAvailability] = useState<{ key: string; slots: Slot[]; error: string }>({ key: '', slots: [], error: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const key = selection ? `${selection.date}/${selection.time}` : '';
  useEffect(() => {
    if (!selection || !access) return;
    let active = true;
    getRescheduleSlots(access.code, access.reservation.reservation_date, selection).then(slots => {
      if (!active) return;
      setSpace(previous => slots.some(slot => slot.id === previous) ? previous : null);
      setAvailability({ key, slots, error: '' });
    }).catch(error => { if (active) setAvailability({ key, slots: [], error: rescheduleError(error) }); });
    return () => { active = false; };
  }, [key, access]);
  const loading = !!selection && availability.key !== key;
  const slots = availability.key === key ? availability.slots : [];
  const selected = slots.find(slot => slot.id === space);
  const unchanged = !!initial && selection?.date === initial.date && selection.time === initial.time && space === initial.espacio;
  const save = async () => {
    if (lock.current || !access || !selection || !selected || loading) return;
    lock.current = true; setSaving(true); setError('');
    try {
      const result = await rescheduleReservation(access.code, access.reservation.reservation_date, { ...selection, espacio: selected.id });
      setAccess({ code: result.code, reservation: result });
      if (mounted.current) {
        Alert.alert('Turno actualizado', `Tu reserva es ${result.reservation_number}.\nCódigo: ${result.code}. Guardá el código y la nueva fecha para consultar tu reserva.`, [{ text: 'Entendido', onPress: () => navigation.goBack() }], { cancelable: false });
      }
    } catch (error) { if (mounted.current) setError(rescheduleError(error)); }
    finally { lock.current = false; if (mounted.current) setSaving(false); }
  };
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver a la reserva" disabled={saving} onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.arrow}>‹</Text></Pressable>
      <Text style={styles.headerTitle}>Cambiar turno</Text>
    </View>
    <View style={styles.sheet}><ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.content}>
        {!access || !access.reservation.can_reschedule ? <><Text style={styles.text}>Consultá una reserva confirmada que todavía no haya comenzado para cambiar su turno.</Text><ActionButton surface="light" label="Consultar reserva" onPress={() => navigation.navigate('HaveTurn')} /></> : <>
          <Text style={styles.title}>Elegí tu nuevo turno</Text>
          <Text style={styles.text}>Conservás los {access.reservation.duration_minutes} minutos y el pago de tu reserva. Tu turno actual queda reservado hasta que guardes el cambio.</Text>
          <View pointerEvents={saving ? 'none' : 'auto'}>
            <CircleBookingSelector initialSelection={initial} defaultDuration={access.reservation.duration_minutes} fixedDuration onChange={setSelection} />
          </View>
          <View style={styles.card} pointerEvents={saving ? 'none' : 'auto'}>
            <Text style={styles.label}>Elegí tu espacio</Text>
            {!selection ? <Text style={styles.text}>Elegí un día y horario.</Text> : loading ? <ActivityIndicator color={colors.blue} /> : availability.error ? <Text style={styles.error}>{availability.error}</Text> : !slots.length ? <Text style={styles.text}>No hay espacios disponibles. Elegí otro turno.</Text> : <SpaceDropdown slots={slots} value={space} onChange={setSpace} />}
          </View>
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <ActionButton surface="light" label={saving ? 'Guardando…' : 'Guardar nuevo turno'} disabled={saving || loading || !selection || !selected || !!availability.error || unchanged} onPress={() => void save()} />
          <ActionButton surface="light" variant="secondary" label="Conservar mi turno" disabled={saving} onPress={() => navigation.goBack()} />
        </>}
      </View>
    </ScrollView></View>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blue },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 20 },
  back: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  arrow: { fontSize: 36, lineHeight: 40, marginTop: -3, color: '#FFFFFF' },
  headerTitle: { flex: 1, color: '#FFFFFF', fontSize: 26, lineHeight: 34, fontWeight: '700' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  scroll: { padding: 24, paddingBottom: 32, alignItems: 'center' },
  content: { width: '100%', maxWidth: 480, gap: 24 },
  title: { color: colors.ink, fontSize: 24, lineHeight: 32, fontWeight: '700' },
  text: { color: colors.label, fontSize: 15, lineHeight: 22 },
  label: { color: colors.ink, fontSize: 17, lineHeight: 24, fontWeight: '600' },
  card: { padding: 20, borderRadius: 24, backgroundColor: '#EFF4FC', gap: 16 },
  error: { color: '#AD2936', fontSize: 14, lineHeight: 22 },
});
