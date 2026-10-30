import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, AppState, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import type { RootStackParamList } from '../App';
import { apiErrorMessage, cancelReservation, getCheckoutStatus, startCheckout, type CheckoutStatus } from '../src/services/api';
import { checkoutHistory, clearCheckoutSession, loadCheckoutSession, type CheckoutSession } from '../src/services/checkoutSession';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckoutStatus'>;
const messages: Record<string, string> = {
  creating: 'Estamos preparando tu pago. Consultá el estado antes de volver a intentar.',
  pending: 'Tu pago está pendiente. El turno se confirma cuando recibimos la aprobación.',
  failed: 'El pago fue rechazado o cancelado. Podés volver al checkout mientras el turno siga vigente.',
  expired: 'La retención del turno venció. Si pagaste, consultá nuevamente o contactanos antes de reservar otro turno.',
  refunded: 'El pago fue devuelto o tuvo un contracargo. Consultanos para conocer el detalle.',
  review: 'Recibimos un pago que requiere revisión. Contactanos indicando el número de reserva.',
};
export default function CheckoutStatusScreen({ navigation }: Props) {
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [message, setMessage] = useState('Consultando tu pago…');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<number[]>([]);
  const selectedID = useRef<number | undefined>(undefined);
  const active = useRef(true);
  const lock = useRef(false);
  const currentSession = useRef<CheckoutSession | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const refresh = useCallback(async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true);
    try {
      const ids = await checkoutHistory();
      const saved = await loadCheckoutSession(selectedID.current) || (ids.length ? await loadCheckoutSession(ids[ids.length - 1]) : null);
      if (mounted.current) setHistory(ids);
      currentSession.current = saved;
      if (!mounted.current) return;
      setSession(saved);
      if (!saved) { setStatus(null); setMessage('No hay una reserva guardada en este dispositivo.'); return; }
      const result = await getCheckoutStatus(saved.booking.data.id, saved.booking.access_token);
      if (!mounted.current) return;
      setStatus(result); setMessage('');
    } catch (error) {
      if (mounted.current) { setStatus(null); setMessage(apiErrorMessage(error)); }
    } finally { lock.current = false; if (mounted.current) setBusy(false); }
  }, []);

  useFocusEffect(useCallback(() => {
    active.current = true; selectedID.current = undefined; void refresh();
    // Bounded foreground polling; webhooks and server reconciliation continue when the app is closed.
    let polls = 0;
    const timer = setInterval(() => { if (++polls <= 12 && AppState.currentState === 'active') void refresh(); }, 5000);
    return () => { active.current = false; clearInterval(timer); };
  }, [refresh]));
  useEffect(() => {
    const app = AppState.addEventListener('change', value => { if (value === 'active' && active.current) void refresh(); });
    const link = Linking.addEventListener('url', ({ url }) => {
      if (url.split('?')[0] === 'uash://checkout/result') {
        if (Platform.OS === 'ios') { try { WebBrowser.dismissBrowser(); } catch {} }
        if (active.current) void refresh();
      }
    });
    return () => { app.remove(); link.remove(); };
  }, [refresh]);

  const pay = async () => {
    if (lock.current || !currentSession.current) return;
    lock.current = true; setBusy(true);
    try {
      const { booking } = currentSession.current;
      const result = await startCheckout(booking.data.id, booking.access_token);
      setStatus(result);
      if (!result.checkout_url) { setMessage('Este turno ya no admite iniciar un pago. Consultá su estado.'); return; }
      await WebBrowser.openBrowserAsync(result.checkout_url);
    } catch (error) { setMessage(apiErrorMessage(error)); }
    finally { lock.current = false; if (mounted.current) { setBusy(false); void refresh(); } }
  };
  const release = async () => {
    if (lock.current || !currentSession.current) return;
    lock.current = true; setBusy(true);
    try {
      const { booking } = currentSession.current;
      await cancelReservation(booking.data.id, booking.access_token);
      await clearCheckoutSession();
      navigation.replace('Home');
    } catch (error) { setMessage(apiErrorMessage(error)); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  const confirmed = status?.verified === true && status.status === 'completed' && status.reservation_status === 'confirmed';
  const canPay = !confirmed && status?.reservation_status === 'pending' && !!status?.checkout_url;
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.title}>{confirmed ? '¡Reserva confirmada!' : 'Estado de tu pago'}</Text>
      {session && <Text style={styles.text}>Reserva #{session.booking.data.id}</Text>}
      {status && <>
        <Text style={styles.text}>{confirmed ? 'El backend verificó tu pago aprobado.' : messages[status.status] || 'Consultá el estado para conocer el resultado.'}</Text>
        <Text style={styles.text}>Total: ${(status.amount_cents / 100).toLocaleString('es-AR')} {status.currency}</Text>
        {session && <Text style={styles.text}>Turno: {new Date(session.booking.data.start_time).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}</Text>}
      </>}
      {!!message && <Text accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>}
      <TouchableOpacity style={styles.button} disabled={busy} onPress={() => void refresh()}><Text style={styles.label}>{busy ? 'Consultando…' : 'Actualizar estado'}</Text></TouchableOpacity>
      {canPay && <TouchableOpacity style={styles.button} disabled={busy} onPress={() => void pay()}><Text style={styles.label}>Continuar en Mercado Pago</Text></TouchableOpacity>}
      {session && !status && <TouchableOpacity style={styles.button} disabled={busy} onPress={() => void pay()}><Text style={styles.label}>Preparar checkout</Text></TouchableOpacity>}
      {session && (!status || (status.reservation_status === 'pending' && !['completed', 'review'].includes(status.status))) &&
        <TouchableOpacity style={styles.secondary} disabled={busy} onPress={() => Alert.alert('Cancelar reserva', 'El turno se libera. Si ya pagaste, consultá el estado antes de cancelar.', [{ text: 'Volver', style: 'cancel' }, { text: 'Cancelar reserva', style: 'destructive', onPress: () => void release() }])}><Text>Cancelar reserva</Text></TouchableOpacity>}
      {session && status && (confirmed || ['refunded', 'expired'].includes(status.status) || status.reservation_status === 'cancelled') &&
        <TouchableOpacity style={styles.secondary} disabled={busy} onPress={() => { void clearCheckoutSession().then(() => navigation.navigate('ChooseDate')).catch(() => setMessage('No pudimos guardar el cambio. Reintentá.')); }}><Text>Hacer otra reserva (conservar comprobante)</Text></TouchableOpacity>}
      {history.length > 1 && <View style={{ gap: 12 }}><Text>Mis reservas guardadas</Text>{history.map(id => <TouchableOpacity key={id} disabled={busy} onPress={() => { selectedID.current = id; void refresh(); }}><Text>Consultar reserva #{id}</Text></TouchableOpacity>)}</View>}
      <TouchableOpacity style={styles.secondary} onPress={() => navigation.navigate('Home')}><Text>Volver al inicio</Text></TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { flexGrow: 1, padding: 24, gap: 18, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', color: '#222' },
  text: { fontSize: 17, lineHeight: 26, color: '#333' },
  button: { backgroundColor: '#000', padding: 16, borderRadius: 12, alignItems: 'center' },
  label: { color: '#fff', fontWeight: '600', fontSize: 17 },
  secondary: { padding: 16, alignItems: 'center' },
});
