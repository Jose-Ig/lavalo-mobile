import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, Image, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { isAxiosError } from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as WebBrowser from 'expo-web-browser';
import type { RootStackParamList } from '../App';
import { useHomeAction } from '../src/context/HomeActionContext';
import ActionButton from '../src/components/ActionButton';
import { apiErrorMessage, cancelReservation, getCheckoutStatus, getReservation, startCheckout, type CheckoutStatus } from '../src/services/api';
import { clearCheckoutSession, loadCheckoutSession, type CheckoutSession } from '../src/services/checkoutSession';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'CheckoutStatus'>;
type Stage = 'loading' | 'ready' | 'known' | 'error' | 'empty';
const messages: Record<string, string> = {
  creating: 'Estamos preparando tu pago. El estado se actualizará automáticamente.',
  pending: 'Podés continuar en Mercado Pago. El turno se confirma al verificar la aprobación.',
  failed: 'El pago no se completó. Si el turno sigue vigente, podés volver al checkout.',
  expired: 'La retención del turno venció. Si pagaste, esperá la actualización antes de reservar otro turno.',
  refunded: 'El pago fue devuelto o tuvo un contracargo. Contactanos para conocer el detalle.',
  review: 'Este pago requiere revisión. Contactanos indicando el número de reserva.',
};
function paymentMessage(status: CheckoutStatus): string {
  if (status.status === 'completed' && status.verified && status.reservation_status === 'confirmed') return 'Tu pago fue aprobado y tu turno está confirmado.';
  if (status.issue === 'legacy_preferences') return 'Esta reserva usa un checkout anterior. Si no pagaste, podés cancelarla y elegir otro turno. Si pagaste, contactanos antes de volver a pagar.';
  if (status.issue === 'order_canceled') return 'La orden de pago de esta reserva fue cancelada. Cancelá la reserva antes de elegir otro turno.';
  if (status.reservation_status === 'cancelled' && !['review', 'refunded'].includes(status.status)) return 'Esta reserva está cancelada.';
  return messages[status.status] || 'Esperando la confirmación del pago.';
}
export default function CheckoutStatusScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { register: registerHomeAction, requestHome } = useHomeAction();
  const [homeRequested, setHomeRequested] = useState(false);
  const confirmationOpen = useRef(false);
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
    if (lock.current || confirmationOpen.current) return;
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
      if (!result.checkout_url) { setMessage('Este turno ya no admite iniciar un pago. Esperá la actualización del estado.'); return; }
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
    } catch (error) {
      setActionError(isAxiosError(error) && error.response?.status === 409
        ? 'La reserva cambió de estado y no se pudo cancelar. Verificá el estado antes de salir.'
        : 'No pudimos cancelar la reserva. Revisá tu conexión y volvé a intentarlo.');
    }
    finally { lock.current = false; if (mounted.current) setBusy(false); }
  };
  const confirmCancellation = () => {
    const booking = currentSession.current?.booking;
    if (!booking || lock.current || confirmationOpen.current) return;
    confirmationOpen.current = true;
    const turn = new Date(booking.data.start_time).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
    Alert.alert(
      booking.data.parent_reservation_id ? '¿Cancelar el tiempo adicional?' : '¿Cancelar esta reserva?',
      booking.data.parent_reservation_id ? `Se liberará el tiempo adicional del ${turn}. Tu reserva original se conserva.` : `Se liberará tu turno del ${turn}. Esta acción no se puede deshacer.`,
      [
        { text: 'Conservar reserva', style: 'cancel', isPreferred: true, onPress: () => { confirmationOpen.current = false; } },
        { text: 'Cancelar reserva', style: 'destructive', onPress: () => { confirmationOpen.current = false; void release(); } },
      ],
      { cancelable: true, onDismiss: () => { confirmationOpen.current = false; } },
    );
  };
  const confirmed = !!status && status.verified && status.status === 'completed' && status.reservation_status === 'confirmed';
  const canPay = stage === 'ready' || (stage === 'known' && !confirmed && status?.reservation_status === 'pending' && !!status.checkout_url);
  const reservation = session?.booking.data;
  const reservationNumber = status?.reservation_number || reservation?.reservation_number;
  const canCancel = !confirmed && !!reservation && reservation.status === 'pending' && status?.reservation_status !== 'confirmed' && status?.reservation_status !== 'completed' && (stage === 'ready' || (stage === 'known' && status && (!['completed', 'review'].includes(status.status) || status.issue === 'legacy_preferences')));
  // Bottom-bar Home uses the same cancellation dialog and authenticated DELETE as Cancel reservation.
  // A paid booking returns Home normally. Unknown/loading state must not abandon a pending hold.
  useFocusEffect(useCallback(() => registerHomeAction(() => {
    if (confirmationOpen.current) return;
    if (lock.current) { setHomeRequested(true); return; }
    const booking = currentSession.current?.booking;
    if (confirmed || booking?.data.status === 'confirmed' || booking?.data.status === 'completed' || booking?.data.status === 'cancelled' || stage === 'empty') {
      navigation.navigate('Home');
    } else if (booking?.data.status === 'pending') {
      if (status?.status === 'completed' || status?.status === 'review') {
        Alert.alert('Estamos verificando tu pago', 'La reserva requiere verificar el pago antes de poder cancelarla.');
        void refresh();
      } else {
        confirmCancellation();
      }
    } else {
      void refresh();
    }
  }), [registerHomeAction, confirmed, stage, status, navigation, refresh, confirmCancellation]));
  useEffect(() => {
    if (homeRequested && !busy) {
      setHomeRequested(false);
      requestHome(() => navigation.navigate('Home'));
    }
  }, [homeRequested, busy, requestHome, navigation]);
  const heading = confirmed ? reservation?.parent_reservation_id ? '¡Tiempo agregado!' : '¡Reserva confirmada!' : canPay ? null : stage === 'loading' ? 'Consultando tu reserva' : stage === 'empty' ? 'Tus reservas' : 'Estado de tu pago';
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}><Text style={styles.headerTitle}>Pago</Text></View>
    <View style={styles.sheet}><ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.content}>
        {!!heading && <Text style={styles.title} accessibilityRole="header">{heading}</Text>}
        {!!reservation && <View style={styles.reservationCard}>
          <Text style={styles.cardTitle}>{reservation.parent_reservation_id ? 'Ampliación de tu reserva' : reservationNumber ? `Reserva ${reservationNumber}` : 'Tu reserva'}</Text>
          <Text style={[styles.text, styles.assignedSpace]}>Tu espacio asignado es el N° {reservation.slot_id}</Text>
          <Text style={styles.text}>{new Date(reservation.start_time).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</Text>
          <Text style={styles.text}>{reservation.duration_minutes} minutos</Text>
          {!!status && <Text style={styles.total}>{(status.amount_cents / 100).toLocaleString('es-AR', { style: 'currency', currency: status.currency })}</Text>}
        </View>}
        {!!status && <View style={[styles.statusCard, confirmed && styles.confirmed]}><Text style={styles.text}>{confirmed && reservation?.parent_reservation_id ? 'Tu pago fue aprobado y el tiempo adicional ya se agregó a tu reserva.' : paymentMessage(status)}</Text></View>}
        {confirmed && !!reservation?.parent_reservation_id && <ActionButton surface="light" label="Volver a mi reserva" onPress={() => navigation.navigate('HaveTurn')} />}
        {confirmed && !!status?.confirmation_code && <View style={styles.reservationCard}>
          <Text style={styles.cardTitle}>Tu código de reserva</Text>
          <Text selectable style={styles.confirmationCode}>{status.confirmation_code}</Text>
          <Text style={styles.text}>Guardalo para consultar esta reserva y validar el QR de tu espacio desde “Tengo una reserva”. Cada reserva tiene su propio código.</Text>
          {status.notification_status === 'pending_configuration' && <Text style={styles.text}>El envío de mensajes todavía no está configurado. Por ahora guardá este código.</Text>}
        </View>}
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
          {canCancel && <ActionButton surface="light" variant="danger" label="Cancelar reserva" disabled={busy} onPress={confirmCancellation} />}
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
  assignedSpace: { fontWeight: '700' },
  confirmationCode: { color: colors.ink, fontSize: 18, lineHeight: 28, fontWeight: '700', letterSpacing: 1 },
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
