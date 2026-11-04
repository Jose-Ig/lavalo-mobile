import React, { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import ActionButton from '../src/components/ActionButton';
import ReservationEditor from '../src/components/ReservationEditor';
import { createReservation, apiErrorMessage, type BookingResponse } from '../src/services/api';
import { saveCheckoutSession } from '../src/services/checkoutSession';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;
const formatDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });
};
function Detail({ label, value }: { label: string; value: string }) {
  return <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value}</Text></View>;
}
export default function PaymentScreen({ navigation, route }: Props) {
  const { reservation } = route.params;
  const [editing, setEditing] = useState<'turn' | 'contact' | null>(null);
  const [pending, setPending] = useState<BookingResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const insets = useSafeAreaInsets();
  const reserve = async () => {
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      const result = pending || await createReservation(reservation);
      setPending(result);
      await saveCheckoutSession(result);
      navigation.navigate('CheckoutStatus', { reservationId: result.data.id });
    } catch (error) { Alert.alert('No pudimos reservar', apiErrorMessage(error)); }
    finally { savingRef.current = false; setSaving(false); }
  };
  const total = (reservation.duration / 60) * 5000;
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver a los datos de reserva" onPress={() => navigation.goBack()} disabled={saving}
        android_ripple={{ color: 'rgba(255,255,255,0.25)', borderless: true }} style={styles.back}><Text accessible={false} style={styles.arrow}>‹</Text></Pressable>
      <Text style={styles.headerTitle}>Pago</Text>
    </View>
    <View style={styles.sheet}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.intro}><Text style={styles.title} accessibilityRole="header">Revisá tu reserva</Text><Text style={styles.description}>Confirmá los datos antes de continuar al pago.</Text></View>
          <View style={styles.turnCard}>
            <View style={styles.cardHeader}><Text style={styles.cardTitle} accessibilityRole="header">Tu turno</Text><Pressable accessibilityRole="button" accessibilityLabel="Editar turno" disabled={saving || !!pending} onPress={() => setEditing('turn')} style={styles.edit}><Text style={[styles.editLabel, (saving || !!pending) && styles.editDisabled]}>Editar</Text></Pressable></View>
            <Text style={styles.date}>{formatDate(reservation.date)}</Text>
            <View style={styles.badges}><Text style={styles.badge}>{reservation.time} hs</Text><Text style={styles.badge}>{reservation.duration} minutos</Text></View>
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeader}><Text style={styles.cardTitle} accessibilityRole="header">Contacto</Text><Pressable accessibilityRole="button" accessibilityLabel="Editar contacto" disabled={saving || !!pending} onPress={() => setEditing('contact')} style={styles.edit}><Text style={[styles.editLabel, (saving || !!pending) && styles.editDisabled]}>Editar</Text></Pressable></View>
            <Detail label="Nombre" value={[reservation.nombre, reservation.apellido].filter(Boolean).join(' ')} />
            <Detail label="Celular" value={reservation.telefono} />
            {!!reservation.email && <Detail label="Email" value={reservation.email} />}
            <Detail label="Envío" value={reservation.email ? 'WhatsApp y email' : 'WhatsApp'} />
          </View>
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.total}>{total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}<Text style={styles.currency}> ARS</Text></Text>
          </View>
          <View style={styles.actions}>
            {pending && <Text style={styles.pending} accessibilityLiveRegion="polite">{pending.data.reservation_number ? `Reserva ${pending.data.reservation_number} pendiente.` : 'Reserva pendiente.'}{pending.data.expires_at ? ` Vence a las ${new Date(pending.data.expires_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}.` : ''} Se confirma después de verificar el pago.</Text>}
            <ActionButton surface="light" label={saving ? 'Preparando reserva…' : pending ? 'Continuar con mi reserva' : 'Continuar al pago'} disabled={saving} onPress={() => void reserve()} accessibilityHint="Continuá para preparar el checkout de Mercado Pago" />
          </View>
        </View>
      </ScrollView>
    </View>
    {editing && <ReservationEditor section={editing} value={reservation} onClose={() => setEditing(null)} onSave={updated => { navigation.setParams({ reservation: updated }); setEditing(null); }} />}
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blue },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 20 },
  back: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  arrow: { fontSize: 36, lineHeight: 40, marginTop: -3, color: '#FFFFFF' },
  headerTitle: { flex: 1, fontSize: 26, lineHeight: 34, fontWeight: '700', color: '#FFFFFF' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  scroll: { paddingHorizontal: 24, paddingTop: 28, paddingBottom: 32, alignItems: 'center' },
  content: { width: '100%', maxWidth: 480, gap: 20 },
  intro: { gap: 8, marginBottom: 4 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700', color: colors.ink },
  description: { fontSize: 15, lineHeight: 22, color: colors.label },
  turnCard: { backgroundColor: '#EFF4FC', borderRadius: 24, borderWidth: 1, borderColor: '#DCE6F7', padding: 20, gap: 14 },
  card: { backgroundColor: '#FAFBFE', borderRadius: 24, borderWidth: 1, borderColor: '#E1E7F1', padding: 20, gap: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  edit: { minHeight: 48, minWidth: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  editLabel: { color: colors.blue, fontSize: 15, fontWeight: '600' },
  editDisabled: { color: '#71809A' },
  cardTitle: { color: colors.ink, fontSize: 18, lineHeight: 26, fontWeight: '700' },
  date: { color: colors.ink, fontSize: 20, lineHeight: 28, fontWeight: '600', textTransform: 'capitalize' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { borderRadius: 14, overflow: 'hidden', backgroundColor: '#DDE8FB', paddingHorizontal: 12, paddingVertical: 6, color: colors.ink, fontSize: 14, lineHeight: 20, fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start', columnGap: 12, rowGap: 4 },
  rowLabel: { width: 80, color: colors.label, fontSize: 14, lineHeight: 22 },
  rowValue: { flexGrow: 1, flexShrink: 1, flexBasis: 140, color: colors.ink, fontSize: 16, lineHeight: 22, fontWeight: '500' },
  totalCard: { padding: 20, gap: 8, backgroundColor: '#EEF4FF', borderRadius: 24 },
  totalLabel: { fontSize: 15, lineHeight: 22, color: colors.label, fontWeight: '600' },
  total: { fontSize: 32, lineHeight: 40, fontWeight: '700', color: colors.ink },
  currency: { fontSize: 15, fontWeight: '500' },
  actions: { alignItems: 'center', gap: 12, paddingTop: 4 },
  pending: { color: colors.label, fontSize: 14, lineHeight: 22 },
});
