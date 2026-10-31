import React, { useRef, useState } from 'react';
import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import ActionButton from '../src/components/ActionButton';
import { lookupReservationCode, reservationAccessError, verifyReservationSlot } from '../src/services/api';
import { useReservationAccess } from '../src/context/ReservationAccessContext';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'StartService'>;
export default function StartServiceScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { access, setAccess } = useReservationAccess();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const lock = useRef(false);
  const begin = async () => {
    if (!access || lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      const current = await lookupReservationCode(access.code, access.reservation.reservation_date); setAccess({ code: access.code, reservation: current });
      if (!current.can_verify_qr) { setError('El pago debe estar confirmado y tenés que estar dentro del horario de tu turno.'); return; }
      const result = permission?.granted ? permission : await requestPermission();
      if (!result.granted) { setError('Necesitamos acceso a la cámara para leer el QR del espacio.'); return; }
      setScanning(true);
    } catch (error) { setError(reservationAccessError(error)); }
    finally { lock.current = false; setBusy(false); }
  };
  const scanned = async (qr: string) => {
    if (!access || lock.current) return;
    lock.current = true; setBusy(true); setScanning(false); setError('');
    try { const result = await verifyReservationSlot(access.code, qr, access.reservation.reservation_date); setAccess({ code: access.code, reservation: result }); }
    catch (error) { setError(reservationAccessError(error)); }
    finally { lock.current = false; setBusy(false); }
  };
  const verified = !!access?.reservation.qr_verified_at;
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}><Text style={styles.headerTitle}>Tu espacio</Text></View>
    <View style={styles.sheet}><ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.content}>
        {!access ? <><Text style={styles.title}>Primero verificá tu reserva</Text><ActionButton surface="light" label="Ingresar código" onPress={() => navigation.navigate('HaveTurn')} /></> : <>
          <Text style={styles.title}>{verified ? 'Espacio verificado' : 'Escaneá el QR del espacio'}</Text>
          <View style={styles.card}><Text style={styles.label}>{access.reservation.slot_label}</Text><Text selectable style={styles.text}>{access.reservation.code}</Text><Text style={styles.text}>{new Date(access.reservation.start_time).toLocaleString('es-AR', { timeZone: 'America/Argentina/Cordoba' })}</Text></View>
          {verified ? <Text style={styles.text}>El QR corresponde a tu reserva. El encendido del equipo todavía requiere configurar la integración con el controlador del espacio.</Text> : <Text style={styles.text}>Usá el QR del espacio asignado durante el horario de tu turno. Se verifica la reserva y el pago antes de continuar.</Text>}
          {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
          {busy && <ActivityIndicator color={colors.blue} />}
          {scanning && permission?.granted && <View style={styles.cameraFrame}><CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={({ data }) => { void scanned(data); }} /></View>}
          {!verified && <ActionButton surface="light" label={busy ? 'Verificando…' : scanning ? 'Cerrar cámara' : 'Escanear QR'} disabled={busy} onPress={() => scanning ? setScanning(false) : void begin()} />}
          {permission && !permission.granted && !permission.canAskAgain && <ActionButton surface="light" variant="secondary" label="Abrir configuración de cámara" onPress={() => { void Linking.openSettings(); }} />}
        </>}
        <ActionButton surface="light" variant="secondary" label="Consultar otra reserva" disabled={busy} onPress={() => { setAccess(null); navigation.replace('HaveTurn'); }} />
      </View>
    </ScrollView></View>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blue }, header: { paddingHorizontal: 24, paddingBottom: 20 }, headerTitle: { color: '#FFFFFF', fontSize: 26, lineHeight: 34, fontWeight: '700' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }, scroll: { padding: 24, alignItems: 'center' }, content: { width: '100%', maxWidth: 480, gap: 24 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700', color: colors.ink }, label: { fontSize: 18, lineHeight: 26, fontWeight: '600', color: colors.ink }, text: { fontSize: 16, lineHeight: 24, color: colors.label },
  card: { padding: 20, borderRadius: 24, backgroundColor: '#EFF4FC', gap: 10 }, error: { fontSize: 15, lineHeight: 22, color: '#AD2936' }, cameraFrame: { height: 300, borderRadius: 24, overflow: 'hidden' },
});
