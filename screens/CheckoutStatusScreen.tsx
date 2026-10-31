import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { isAxiosError } from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import type { RootStackParamList } from '../App';
import ActionButton from '../src/components/ActionButton';
import { apiErrorMessage, cancelReservation, getCheckoutStatus, getReservation, startCheckout, type CheckoutStatus } from '../src/services/api';
import { clearCheckoutSession, loadCheckoutSession, type CheckoutSession } from '../src/services/checkoutSession';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckoutStatus'>;
type Stage = 'loading' | 'ready' | 'known' | 'error' | 'empty';
const messages: Record<string, string> = {
  creating: 'Estamos preparando tu pago. Consultá el estado antes de volver a intentar.',
  pending: 'Podés continuar en Mercado Pago. El turno se confirma al verificar la aprobación.',
  failed: 'El pago no se completó. Si el turno sigue vigente, podés volver al checkout.',
  expired: 'La retención del turno venció. Si pagaste, consultá nuevamente antes de reservar otro turno.',
  refunded: 'El pago fue devuelto o tuvo un contracargo. Contactanos para conocer el detalle.',
  review: 'Este pago requiere revisión. Contactanos indicando el número de reserva.',
};
function paymentMessage(status: CheckoutStatus): string {
  if (status.status === 'completed' && status.verified && status.reservation_status === 'confirmed') return 'Tu pago fue aprobado y tu turno está confirmado.';
  if (status.issue === 'legacy_preferences') return 'Esta reserva usa un checkout anterior. Si no pagaste, podés cancelarla y elegir otro turno. Si pagaste, contactanos antes de volver a pagar.';
  if (status.issue === 'order_canceled') return 'La orden de pago de esta reserva fue cancelada. Cancelá la reserva antes de elegir otro turno.';
  if (status.reservation_status === 'cancelled' && !['review', 'refunded'].includes(status.status)) return 'Esta reserva está cancelada.';
  return messages[status.status] || 'Consultá el estado para conocer el resultado.';
}
export default function CheckoutStatusScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [status, setStatus] = useState<CheckoutStatus | null>(null);
  const [stage, setStage] = useState<Stage>('loading');
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const selectedID = useRef<number | undefined>(route.params?.reservationId);
  const active = useRef(false);
  const generation = useRef(0);
  const lock = useRef(false);
  const currentSession = useRef<CheckoutSession | null>(null);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; generation.current++; }; }, []);

  const refresh = useCallback(async () => {
    if (lock.current) return;
    const epoch = generation.current;
    const valid = () => mounted.current && epoch === generation.current;
    lock.current = true; setBusy(true);
    try {
      // An explicit reservation never falls back to a different saved payment or historical entry.
      const saved = await loadCheckoutSession(selectedID.current);
      if (!valid()) return;
      currentSession.current = saved; setSession(saved);
      if (!saved) { setStatus(null); setStage('empty'); setMessage('No hay una reserva activa guardada. Podés crear una nueva desde el inicio.'); return; }
      const reservation = await getReservation(saved.booking.data.id, saved.booking.access_token);
      if (!valid()) return;
      const updated = { booking: { ...saved.booking, data: reservation } };
      currentSession.current = updated; setSession(updated);
      let result: CheckoutStatus;
      try { result = await getCheckoutStatus(reservation.id, saved.booking.access_token); }
      catch (error) {
        if (!valid()) return;
        if (isAxiosError(error) && error.response?.status === 404) {
          // Reservation was verified above; no checkout yet is a normal pre-payment state.
          setStatus(null);
          if (reservation.status === 'pending' && reservation.expires_at && Date.parse(reservation.expires_at) > Date.now()) {
            setStage('ready'); setMessage('');
          } else {
            setStage('known'); setMessage(reservation.status === 'cancelled' ? 'Esta reserva está cancelada.' : 'La retención de este turno ya venció.');
          }
          return;
        }
        throw error;
      }
      if (!valid()) return;
      if (result.reservation_id !== reservation.id) throw new Error('Reservation mismatch');
      setStatus(result); setStage('known'); setMessage('');
    } catch (error) {
      if (valid()) { setStatus(null); setStage('error'); setMessage(apiErrorMessage(error)); }
    } finally { if (valid()) { lock.current = false; setBusy(false); } }
  }, []);
  const selectReservation = useCallback((id?: number) => {
    generation.current++; lock.current = false; selectedID.current = id; currentSession.current = null;
    setSession(null); setStatus(null); setStage('loading'); setMessage(''); setActionError(''); void refresh();
  }, [refresh]);
  useFocusEffect(useCallback(() => {
    active.current = true; selectReservation(route.params?.reservationId);
    let polls = 0;
    const timer = setInterval(() => { if (++polls <= 12 && AppState.currentState === 'active') void refresh(); }, 5000);
    return () => { active.current = false; generation.current++; clearInterval(timer); };
  }, [route.params?.reservationId, refresh, selectReservation]));
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
    const epoch = generation.current;
    const valid = () => mounted.current && epoch === generation.current;
    lock.current = true; setBusy(true); setActionError(''); setMessage('Preparando tu pago…');
    try {
      const { booking } = currentSession.current;
      const result = await startCheckout(booking.data.id, booking.access_token);
      if (!valid()) return;
      if (result.reservation_id !== booking.data.id) throw new Error('Reservation mismatch');
      setStatus(result); setStage('known');
      if (!result.checkout_url) { setMessage('Este turno ya no admite iniciar un pago. Consultá su estado.'); return; }
      setMessage(''); await WebBrowser.openBrowserAsync(result.checkout_url);
    } catch (error) { if (valid()) setActionError(apiErrorMessage(error)); }
    finally { if (valid()) { lock.current = false; setBusy(false); void refresh(); } }
  };
  const release = async () => {
    if (lock.current || !currentSession.current) return;
    const { booking } = currentSession.current;
    lock.current = true; setBusy(true);
    try {
      await cancelReservation(booking.data.id, booking.access_token);
      await clearCheckoutSession(booking.data.id); navigation.replace('Home');
    } catch (error) { setMessage(apiErrorMessage(error)); }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  const confirmCancellation = () => {
    const booking = currentSession.current?.booking;
    if (!booking || lock.current) return;
    const turn = new Date(booking.data.start_time).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    Alert.alert(
      '¿Cancelar esta reserva?',
      `Se liberará tu turno del ${turn}. Esta acción no se puede deshacer.\n\nSi ya pagaste, conservá la reserva y consultá el estado del pago antes de cancelar.`,
      [
        { text: 'Conservar reserva', style: 'cancel', isPreferred: true },
        { text: 'Cancelar reserva', style: 'destructive', onPress: () => void release() },
      ],
      { cancelable: true },
    );
  };
  const confirmed = !!status && status.verified && status.status === 'completed' && status.reservation_status === 'confirmed';
  const canPay = stage === 'ready' || (stage === 'known' && !confirmed && status?.reservation_status === 'pending' && !!status.checkout_url);
  const reservation = session?.booking.data;
  const canCancel = !!reservation && reservation.status === 'pending' && (stage === 'ready' || (stage === 'known' && status && (!['completed', 'review'].includes(status.status) || status.issue === 'legacy_preferences')));
  const canCreate = stage === 'empty' || (stage === 'known' && (confirmed || reservation?.status === 'cancelled' || status?.status === 'expired' || status?.status === 'refunded' || (!status && !!reservation?.expires_at && Date.parse(reservation.expires_at) <= Date.now())));
  const heading = confirmed ? '¡Reserva confirmada!' : canPay ? null : stage === 'loading' ? 'Consultando tu reserva' : stage === 'empty' ? 'Tus reservas' : 'Estado de tu pago';
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}><Text style={styles.headerTitle}>Pago</Text></View>
    <View style={styles.sheet}><ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.content}>
        {!!heading && <Text style={styles.title} accessibilityRole="header">{heading}</Text>}
        {!!reservation && <View style={styles.reservationCard}>
          <Text style={styles.cardTitle}>Reserva #{reservation.id}</Text>
          <Text style={styles.text}>{new Date(reservation.start_time).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</Text>
          <Text style={styles.text}>{reservation.duration_minutes} minutos</Text>
          {!!status && <Text style={styles.total}>{(status.amount_cents / 100).toLocaleString('es-AR', { style: 'currency', currency: status.currency })}</Text>}
        </View>}
        {!!status && <View style={[styles.statusCard, confirmed && styles.confirmed]}><Text style={styles.text}>{paymentMessage(status)}</Text></View>}
        {!!message && <Text accessibilityLiveRegion="polite" style={styles.text}>{message}</Text>}
        {!!actionError && <Text accessibilityRole="alert" style={styles.error}>{actionError}</Text>}
        {stage === 'loading' && <ActivityIndicator size="large" color={colors.blue} />}
        {canPay && <View style={styles.methodsSection}>
          <Text style={styles.cardTitle}>Medio de pago</Text>
          <View style={styles.methodsGrid}>
            <Pressable accessibilityRole="button" accessibilityLabel="Pagar con Mercado Pago" accessibilityHint="Abrí el checkout de Mercado Pago para esta reserva" accessibilityState={{ disabled: busy }} disabled={busy}
              onPress={() => void pay()} android_ripple={{ color: '#D9E6FF' }} style={({ pressed }) => [styles.method, (pressed || busy) && styles.dimmed]}>
              <Image accessible={false} source={require('../assets/payments/mercadopago.png')} style={styles.logo} resizeMode="contain" />
              {busy ? <ActivityIndicator color={colors.blue} /> : <Text style={styles.methodLabel}>Pagar</Text>}
            </Pressable>
          </View>
        </View>}
        <View style={styles.actions}>
          {!!session && <ActionButton surface="light" label={busy ? 'Consultando…' : 'Consultar estado'} disabled={busy} onPress={() => { setActionError(''); void refresh(); }} />}
          {canCancel && <ActionButton surface="light" variant="danger" label="Cancelar reserva" disabled={busy} onPress={confirmCancellation} />}
          {canCreate && <ActionButton surface="light" label="Hacer otra reserva" disabled={busy} onPress={() => { void clearCheckoutSession(reservation?.id).then(() => navigation.navigate('ChooseDate')).catch(() => setMessage('No pudimos guardar el cambio. Reintentá.')); }} />}
          <ActionButton surface="light" variant="secondary" label="Volver al inicio" disabled={busy} onPress={() => navigation.navigate('Home')} />
        </View>

      </View>
    </ScrollView></View>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blue },
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  headerTitle: { color: '#FFFFFF', fontSize: 26, lineHeight: 34, fontWeight: '700' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  scroll: { padding: 24, paddingBottom: 32, alignItems: 'center' },
  content: { width: '100%', maxWidth: 480, gap: 24 },
  title: { color: colors.ink, fontSize: 26, lineHeight: 34, fontWeight: '700' },
  reservationCard: { padding: 20, borderRadius: 24, backgroundColor: '#EFF4FC', gap: 8 },
  cardTitle: { color: colors.ink, fontSize: 18, lineHeight: 26, fontWeight: '700' },
  text: { color: colors.label, fontSize: 16, lineHeight: 24 },
  total: { color: colors.ink, fontSize: 28, lineHeight: 36, fontWeight: '700', marginTop: 4 },
  statusCard: { padding: 20, borderRadius: 20, backgroundColor: '#F1F4F8' },
  confirmed: { backgroundColor: '#E5F5EB' },
  methodsSection: { gap: 16 },
  methodsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  method: { width: '47%', minWidth: 140, maxWidth: 176, aspectRatio: 1, padding: 12, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#B7CAE7', borderRadius: 16, overflow: 'hidden' },
  logo: { width: '100%', height: '68%' },
  methodLabel: { color: colors.ink, fontSize: 16, lineHeight: 22, fontWeight: '600' },
  error: { color: '#AD2936', fontSize: 15, lineHeight: 22 },
  dimmed: { opacity: 0.6 },
  actions: { alignItems: 'center', gap: 12 },
});
