import { formatSpaceLabel } from '../services/reservationDisplay';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ActionButton from './ActionButton';
import { lookupReservationCode, reservationAccessError, verifyReservationSlot, type ReservationAccess } from '../services/api';
import { homeTheme as colors } from '../theme/home';
type Props = { reservation: ReservationAccess; onVerified: (value: ReservationAccess) => void; onClose: () => void };
export default function ReservationScanner({ reservation, onVerified, onClose }: Props) {
 const insets = useSafeAreaInsets();
 const [permission, requestPermission] = useCameraPermissions();
 const [scanning, setScanning] = useState(false);
 const [busy, setBusy] = useState(false);
 const [error, setError] = useState('');
 const lock = useRef(false);
 const begin = async () => {
  if(lock.current) return;
  lock.current=true;setBusy(true);setError('');
  try {
   const current=await lookupReservationCode(reservation.code,reservation.reservation_date);
   if(current.qr_verified_at) { onVerified(current);return; }
   if(!current.can_verify_qr) {
    if(current.activation_reason==='too_early') {
     const start=new Date(current.start_time);
     const time=start.toLocaleTimeString('es-AR',{timeZone:'America/Argentina/Cordoba',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
     const minutes=Math.max(1,Math.ceil((start.getTime()-Date.now())/60000));
     setError(`El espacio aún no está disponible para tu turno de las ${time}, se liberará en ${minutes} ${minutes===1?'minuto':'minutos'}.`);
    } else setError('El pago debe estar confirmado y tenés que estar dentro del horario de tu turno.');
    return;
   }
   const result=permission?.granted?permission:await requestPermission();
   if(!result.granted) {setError('Necesitamos acceso a la cámara para leer el QR del espacio.');return;}
   setScanning(true);
  } catch(error) {setError(reservationAccessError(error));}
  finally {lock.current=false;setBusy(false);}
 };
 useEffect(() => { void begin(); }, []);
 const scanned=async(qr:string)=>{
  if(lock.current) return;
  lock.current=true;setBusy(true);setScanning(false);setError('');
  try {onVerified(await verifyReservationSlot(reservation.code,qr,reservation.reservation_date));}
  catch(error){setError(reservationAccessError(error));}
  finally {lock.current=false;setBusy(false);}
 };
 return <Modal visible animationType="slide" onRequestClose={()=>{if(!lock.current)onClose();}}>
  <ScrollView style={{ flex: 1, backgroundColor: '#FFFFFF' }} contentContainerStyle={[styles.root,{paddingTop:insets.top+24,paddingBottom:Math.max(insets.bottom,24)}]} accessibilityViewIsModal>
   <Text style={styles.title}>Escaneá el QR de tu espacio</Text>
   <Text style={styles.text}>{formatSpaceLabel(reservation.slot_label)} · Reserva {reservation.reservation_number}</Text>
   <Text style={styles.text}>Se verifica que el QR corresponda a tu espacio, dentro del horario de tu turno y con el pago confirmado.</Text>
   {scanning && permission?.granted && <View style={styles.camera}><CameraView style={StyleSheet.absoluteFill} facing="back" barcodeScannerSettings={{barcodeTypes:['qr']}} onBarcodeScanned={({data})=>{void scanned(data);}} /></View>}
   {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
   {busy && <ActivityIndicator color={colors.blue} />}
   {!scanning && <ActionButton surface="light" label={busy?'Verificando…':'Abrir cámara'} disabled={busy} onPress={()=>void begin()} />}
   {permission && !permission.granted && !permission.canAskAgain && <ActionButton surface="light" label="Abrir configuración de cámara" onPress={()=>void Linking.openSettings()} />}
   <ActionButton surface="light" variant="secondary" label="Cerrar" disabled={busy} onPress={onClose} />
  </ScrollView>
 </Modal>;
}
const styles=StyleSheet.create({root:{flexGrow:1,backgroundColor:'#FFFFFF',paddingHorizontal:24,gap:24,alignItems:'center'},title:{fontSize:24,lineHeight:32,fontWeight:'700',color:colors.ink},text:{fontSize:16,lineHeight:24,color:colors.label},error:{fontSize:15,lineHeight:22,color:'#AD2936'},camera:{height:300,width:'100%',maxWidth:480,borderRadius:24,overflow:'hidden'}});
