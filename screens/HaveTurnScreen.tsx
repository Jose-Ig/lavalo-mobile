import React, { useRef, useState, useEffect } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import ActionButton from '../src/components/ActionButton';
import { lookupReservationCode, reservationAccessError, type ReservationAccess } from '../src/services/api';
import { useReservationAccess } from '../src/context/ReservationAccessContext';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'HaveTurn'>;
export default function HaveTurnScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { access, setAccess } = useReservationAccess();
  const [code, setCode] = useState('');
  const [date, setDate] = useState(() => {
    const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Argentina/Cordoba', day: '2-digit', month: '2-digit', year: 'numeric' }).formatToParts(new Date());
    const part = (type: string) => parts.find(item => item.type === type)!.value;
    return `${part('day')}/${part('month')}/${part('year')}`;
  });
  const [reservation, setReservation] = useState<ReservationAccess | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const scroll = useRef<React.ComponentRef<typeof ScrollView> | null>(null);
  const detailY = useRef<number | null>(null);
  const revealPending = useRef(false);
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
    lock.current = true; setBusy(true); setError(''); setReservation(null); setAccess(null); Keyboard.dismiss();
    try {
      const result = await lookupReservationCode(code, dateValue);
      revealPending.current = true;
      setReservation(result); setAccess({ code: result.code, reservation: result });
    } catch (error) { setError(reservationAccessError(error)); }
    finally { lock.current = false; setBusy(false); }
  };
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}><Text style={styles.headerTitle}>Tengo una reserva</Text></View>
    <KeyboardAvoidingView style={styles.sheet} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scroll} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" onContentSizeChange={revealDetail}>
        <View style={styles.content}>
          <View style={styles.section}><Text style={styles.title} accessibilityRole="header">Buscá tu reserva</Text><Text style={styles.text}>Ingresá el código y la fecha de tu turno. Podés consultar cualquier reserva, desde cualquier dispositivo.</Text></View>
          <View style={styles.section}><Text style={styles.label}>Código de reserva</Text>
            <TextInput accessibilityLabel="Código de reserva" value={code} editable={!busy} autoCapitalize="characters" autoCorrect={false} maxLength={40} placeholder="123456" placeholderTextColor="#687991" style={styles.input}
              onChangeText={text => { setCode(text.toUpperCase()); setError(''); setReservation(null); setAccess(null); }} returnKeyType="search" onSubmitEditing={() => void lookup()} />
            <Text style={styles.hint}>6 números. Los códigos anteriores también siguen funcionando.</Text>
          </View>
          <View style={styles.section}><Text style={styles.label}>Fecha del turno</Text>
            <TextInput accessibilityLabel="Fecha del turno, día mes y año" editable={!busy} value={date} placeholder="DD/MM/AAAA" placeholderTextColor="#687991" keyboardType="number-pad" maxLength={10} style={styles.input}
              onChangeText={text => { const digits = text.replace(/\D/g, '').slice(0, 8); setDate(digits.length > 4 ? `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}` : digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits); setError(''); setReservation(null); setAccess(null); }} />
            <Text style={styles.hint}>Usá la fecha de la reserva, aunque la hayas comprado otro día.</Text>
          </View>
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          <ActionButton surface="light" label={busy ? 'Buscando…' : 'Consultar reserva'} disabled={busy} onPress={() => void lookup()} />
          {reservation && <View style={styles.card} onLayout={({ nativeEvent }) => { detailY.current = nativeEvent.layout.y; revealDetail(); }}>
            <Text style={styles.label}>{reservation.status === 'confirmed' ? 'Reserva confirmada' : 'Estado de la reserva'}</Text>
            <Text style={styles.text}>Reserva {reservation.reservation_number}</Text>
            <Text selectable style={styles.code}>{reservation.code}</Text>
            <Text style={styles.text}>{new Date(reservation.start_time).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</Text>
            <Text style={styles.text}>{reservation.duration_minutes} minutos · {reservation.slot_label}</Text>
            <Text style={styles.text}>{reservation.can_verify_qr ? 'Ya podés escanear el QR de tu espacio.' : reservation.activation_reason === 'too_early' ? 'Podrás validar el QR al comenzar el horario de tu turno.' : reservation.activation_reason === 'expired' ? 'El horario de este turno ya terminó.' : reservation.status === 'cancelled' ? 'Esta reserva está cancelada y no permite activar un espacio.' : 'Esta reserva no está habilitada para activar un espacio.'}</Text>
            <ActionButton surface="light" variant="secondary" label="Editar reserva" accessibilityHint="Cambiar el día o el horario de tu reserva" disabled={!reservation.can_reschedule} onPress={() => navigation.navigate('ChangeTurn')} />
            {!reservation.can_reschedule && <Text style={styles.hint}>Podés editar el turno de una reserva confirmada antes de su inicio y sin QR validado.</Text>}
            {reservation.status === 'confirmed' && <ActionButton surface="light" label="Continuar al espacio" onPress={() => navigation.navigate('StartService')} />}
          </View>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blue }, header: { paddingHorizontal: 24, paddingBottom: 20 }, headerTitle: { color: '#FFFFFF', fontSize: 26, lineHeight: 34, fontWeight: '700' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }, scroll: { padding: 24, alignItems: 'center' }, content: { width: '100%', maxWidth: 480, gap: 24 },
  section: { gap: 10 }, title: { color: colors.ink, fontSize: 24, lineHeight: 32, fontWeight: '700' }, text: { color: colors.label, fontSize: 16, lineHeight: 24 }, hint: { color: colors.label, fontSize: 13, lineHeight: 20 }, label: { color: colors.ink, fontSize: 17, lineHeight: 24, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#BCCCE4', borderRadius: 16, padding: 16, minHeight: 56, fontSize: 16, color: colors.ink, backgroundColor: '#F8FAFE' }, error: { color: '#AD2936', fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: '#EFF4FC', borderRadius: 24, padding: 20, gap: 16 }, code: { color: colors.ink, fontSize: 17, lineHeight: 26, fontWeight: '700', letterSpacing: 1 },
});
