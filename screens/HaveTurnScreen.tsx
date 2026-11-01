import React, { useCallback, useRef, useState, useEffect } from 'react';
import { AppState, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ReservationCalendar from '../src/components/ReservationCalendar';
import ReservationScanner from '../src/components/ReservationScanner';
import { loadCheckoutSession, saveCheckoutSession } from '../src/services/checkoutSession';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import ActionButton from '../src/components/ActionButton';
import { cancelReservation, createExtension, extensionError, getCheckoutStatus, getExtensionOptions, getReservation, lookupReservationCode, reservationAccessError, type ExtensionOption, type ReservationAccess } from '../src/services/api';
import { useReservationAccess } from '../src/context/ReservationAccessContext';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'HaveTurn'>;
export default function HaveTurnScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { access, setAccess } = useReservationAccess();
  const [code, setCode] = useState('');
  const [reservation, setReservation] = useState<ReservationAccess | null>(null);
  const [pendingExtension, setPendingExtension] = useState<number | null>(null);
  const [calendar, setCalendar] = useState(false);
  const [scanner, setScanner] = useState(false);
  const [extension, setExtension] = useState(false);
  const [options, setOptions] = useState<ExtensionOption[]>([]);
  const [extensionMessage, setExtensionMessage] = useState('');
  const [now, setNow] = useState(Date.now());
  const [date, setDate] = useState(() => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Cordoba', day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date());
    const part = (type: string) => parts.find(item => item.type === type)!.value;
    return `${part('day')}/${part('month')}/${part('year')}`;
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const scroll = useRef<React.ComponentRef<typeof ScrollView> | null>(null);
  const detailY = useRef<number | null>(null);
  const revealPending = useRef(false);
  const currentAccess = useRef(access);
  currentAccess.current = access;
  useFocusEffect(useCallback(() => {
    let active = true;
    const refresh = async () => {
      const saved = currentAccess.current;
      if (!saved || lock.current) return;
      try {
        // Only inspect the current checkout when it belongs to this explicitly looked-up reservation.
        const checkout = await loadCheckoutSession();
        let pending: number | null = null;
        if (checkout?.booking.data.parent_reservation_id === saved.reservation.id) {
          const child = await getReservation(checkout.booking.data.id, checkout.booking.access_token);
          if (child.status !== 'cancelled') {
            try {
              const status = await getCheckoutStatus(child.id, checkout.booking.access_token);
              if (['review', 'refunded'].includes(status.status) || (child.status === 'pending' && !['expired', 'completed'].includes(status.status))) pending = child.id;
            } catch { pending = child.id; }
          }
        }
        const result = await lookupReservationCode(saved.code, saved.reservation.reservation_date);
        if (active && currentAccess.current?.reservation.id === result.id) {
          setAccess({ code: result.code, reservation: result }); setPendingExtension(pending);
        }
      } catch { /* Keep the current detail; explicit lookup still reports errors. */ }
    };
    void refresh();
    const timer = setInterval(() => { setNow(Date.now()); if (AppState.currentState === 'active') void refresh(); }, 10000);
    const app = AppState.addEventListener('change', state => { if (state === 'active') { setNow(Date.now()); void refresh(); } });
    return () => { active = false; clearInterval(timer); app.remove(); };
  }, [setAccess]));
  useEffect(() => {
    if (!reservation?.qr_verified_at) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [reservation?.qr_verified_at]);
  const revealDetail = () => {
    if (!revealPending.current || detailY.current === null) return;
    revealPending.current = false;
    const y = Math.max(0, detailY.current + 8);
    requestAnimationFrame(() => scroll.current?.scrollTo({ y, animated: true }));
  };
  useEffect(() => {
    if (access && reservation && access.reservation.id === reservation.id) {
      setReservation(access.reservation); setCode(access.code);
      const [year, month, day] = access.reservation.reservation_date.split('-');
      setDate(`${day}/${month}/${year}`);
    }
  }, [access, reservation]);
  const lookup = async () => {
    if (lock.current) return;
    if (!code.trim()) { setError('Ingresá tu código de reserva.'); return; }
    const [day, month, year] = date.split('/');
    const parsedDate = new Date(Number(year), Number(month) - 1, Number(day), 12);
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(date) || parsedDate.getFullYear() !== Number(year) || parsedDate.getMonth() !== Number(month) - 1 || parsedDate.getDate() !== Number(day)) { setError('Ingresá la fecha del turno como DD/MM/AAAA.'); return; }
    const dateValue = `${year}-${month}-${day}`;
    detailY.current = null; revealPending.current = false;
    lock.current = true; setBusy(true); setError(''); setReservation(null); setAccess(null); setPendingExtension(null); Keyboard.dismiss();
    try {
      const result = await lookupReservationCode(code, dateValue);
      revealPending.current = true;
      setReservation(result); setAccess({ code: result.code, reservation: result });
    } catch (error) { setError(reservationAccessError(error)); }
    finally { lock.current = false; setBusy(false); }
  };
  const verified = !!reservation?.qr_verified_at;
  const remaining = reservation?.status === 'confirmed' ? Math.max(0, Math.ceil((Date.parse(reservation.end_time) - now) / 1000)) : 0;
  const countdown = `${String(Math.floor(remaining / 3600)).padStart(2, '0')}:${String(Math.floor((remaining % 3600) / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
  const openExtension = async () => {
    if (!reservation || lock.current) return;
    lock.current = true; setBusy(true); setExtension(true); setOptions([]); setExtensionMessage('Consultando disponibilidad…');
    try {
      const result = await getExtensionOptions(reservation.code, reservation.reservation_date);
      setOptions(result); setExtensionMessage(result.length ? 'Elegí cuánto tiempo querés agregar.' : 'No hay tiempo adicional disponible para tu espacio.');
    } catch (error) { setExtensionMessage(extensionError(error)); }
    finally { lock.current = false; setBusy(false); }
  };
  const buyExtension = async (minutes: number) => {
    if (!reservation || lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const booking = await createExtension(reservation.code, reservation.reservation_date, minutes);
      try { await saveCheckoutSession(booking); }
      catch (error) { await cancelReservation(booking.data.id, booking.access_token); throw error; }
      setPendingExtension(booking.data.id);
      setExtension(false); navigation.navigate('CheckoutStatus', { reservationId: booking.data.id });
    } catch (error) { setOptions([]); setExtensionMessage(extensionError(error)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}><Text style={styles.headerTitle}>Tengo una reserva</Text></View>
    <KeyboardAvoidingView style={styles.sheet} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scroll} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" onContentSizeChange={revealDetail}>
        <View style={styles.content}>
          <View style={styles.section}><Text style={styles.title} accessibilityRole="header">Buscá tu reserva</Text><Text style={styles.text}>Ingresá el código y la fecha de tu turno.</Text></View>
          <View style={styles.section}><Text style={styles.label}>Código de reserva</Text>
            <TextInput accessibilityLabel="Código de reserva" value={code} editable={!busy} autoCapitalize="characters" autoCorrect={false} maxLength={40} placeholder="123456-ddmmaa" placeholderTextColor="#687991" style={styles.input}
              onChangeText={text => { setCode(text.toUpperCase()); setError(''); setReservation(null); setAccess(null); }} returnKeyType="search" onSubmitEditing={() => void lookup()} />
          </View>
          <View style={styles.section}><Text style={styles.label}>Fecha del turno</Text>
            <Pressable accessibilityRole="button" accessibilityLabel={`Fecha del turno: ${date}. Abrir calendario`} disabled={busy} style={styles.input} onPress={() => { Keyboard.dismiss(); setCalendar(true); }}><Text style={styles.text}>{date}  ▾</Text></Pressable>
          </View>
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <ActionButton surface="light" label={busy ? 'Buscando…' : 'Consultar reserva'} disabled={busy} onPress={() => void lookup()} />
          {reservation && <View style={styles.card} onLayout={({ nativeEvent }) => { detailY.current = nativeEvent.layout.y; revealDetail(); }}>
            <Text style={styles.label}>{reservation.status === 'confirmed' ? 'Reserva confirmada' : 'Estado de la reserva'}</Text>
            <Text style={styles.text}>Número de reserva: {reservation.reservation_number}</Text>
            <Text style={styles.text}>{new Date(reservation.start_time).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={[styles.text, styles.important]}>{reservation.duration_minutes} minutos · {reservation.slot_label}</Text>
            {!verified && <>
              <Text style={[styles.text, reservation.can_verify_qr && styles.important]}>{reservation.can_verify_qr ? 'Ya podés escanear el QR de tu espacio.' : reservation.activation_reason === 'too_early' ? 'Podrás validar el QR al comenzar el horario de tu turno.' : reservation.activation_reason === 'expired' ? 'El horario de este turno ya terminó.' : reservation.status === 'cancelled' ? 'Esta reserva está cancelada y no permite activar un espacio.' : 'Esta reserva no está habilitada para activar un espacio.'}</Text>
              <ActionButton surface="light" variant="secondary" label="Editar reserva" accessibilityHint="Cambiar el día o el horario de tu reserva" disabled={!reservation.can_reschedule || busy} onPress={() => navigation.navigate('ChangeTurn')} />
              {!reservation.can_reschedule && <Text style={styles.hint}>Podés editar el turno de una reserva confirmada sólo antes de su inicio.</Text>}
              {reservation.status === 'confirmed' && <ActionButton surface="light" label="Escanear QR" disabled={busy || reservation.activation_reason === 'expired'} onPress={() => setScanner(true)} />}
            </>}
            {verified && <>
              <Text style={styles.label}>{remaining > 0 && reservation.status === 'confirmed' ? 'Tiempo restante' : 'Turno finalizado'}</Text>
              <Text accessibilityLabel={`Tiempo restante ${countdown}`} style={styles.countdown}>{countdown}</Text>
              {reservation.status === 'confirmed' && remaining > 0 && !pendingExtension && <ActionButton surface="light" label="Agregar más tiempo" disabled={busy} onPress={() => void openExtension()} />}
              {!!pendingExtension && <ActionButton surface="light" label="Ver pago de tiempo adicional" disabled={busy} onPress={() => navigation.navigate('CheckoutStatus', { reservationId: pendingExtension })} />}
              {reservation.activation_status === 'awaiting_controller' && remaining > 0 && <Text style={styles.hint}>QR validado. El encendido del equipo todavía requiere configurar la integración con el controlador del espacio.</Text>}
            </>}
          </View>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    {calendar && <ReservationCalendar value={date} onClose={() => setCalendar(false)} onSelect={value => { setDate(value); setCalendar(false); setError(''); setReservation(null); setAccess(null); }} />}
    {scanner && reservation && <ReservationScanner reservation={reservation} onClose={() => setScanner(false)} onVerified={value => { setAccess({ code: value.code, reservation: value }); setReservation(value); setNow(Date.now()); setScanner(false); }} />}
    <Modal visible={extension} transparent animationType="slide" onRequestClose={() => { if (!busy) setExtension(false); }}>
      <View style={styles.overlay}><View style={[styles.extensionSheet, { paddingBottom: Math.max(insets.bottom, 24) }]} accessibilityViewIsModal>
        <Text style={styles.title}>Agregar más tiempo</Text>
        <Text accessibilityLiveRegion="polite" style={styles.text}>{extensionMessage}</Text>
        {options.map(option => <ActionButton key={option.minutes} surface="light" label={`${option.minutes} minutos · ${(option.amount_cents / 100).toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`} disabled={busy} onPress={() => void buyExtension(option.minutes)} />)}
        <ActionButton surface="light" variant="secondary" label="Cerrar" disabled={busy} onPress={() => setExtension(false)} />
      </View></View>
    </Modal>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blue }, header: { paddingHorizontal: 24, paddingBottom: 20 }, headerTitle: { color: '#FFFFFF', fontSize: 26, lineHeight: 34, fontWeight: '700' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }, scroll: { padding: 24, alignItems: 'center' }, content: { width: '100%', maxWidth: 480, gap: 24 },
  section: { gap: 10 }, title: { color: colors.ink, fontSize: 24, lineHeight: 32, fontWeight: '700' }, text: { color: colors.label, fontSize: 16, lineHeight: 24 }, hint: { color: colors.label, fontSize: 13, lineHeight: 20 }, label: { color: colors.ink, fontSize: 17, lineHeight: 24, fontWeight: '600' },
  important: { fontWeight: '700' },
  countdown: { color: '#000000', fontSize: 42, lineHeight: 54, fontWeight: '700', fontVariant: ['tabular-nums'], textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  extensionSheet: { backgroundColor: '#FFFFFF', padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28, gap: 20, alignItems: 'center' },
  input: { borderWidth: 1, borderColor: '#BCCCE4', borderRadius: 16, padding: 16, minHeight: 56, fontSize: 16, color: colors.ink, backgroundColor: '#F8FAFE' }, error: { color: '#AD2936', fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: '#EFF4FC', borderRadius: 24, padding: 20, gap: 16 },
});
