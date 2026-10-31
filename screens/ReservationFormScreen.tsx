import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import type { VehicleModel } from '../src/data/vehicleModels';
import ActionButton from '../src/components/ActionButton';
import VehicleModelPicker from '../src/components/VehicleModelPicker';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'ReservationForm'>;
type Field = 'nombre' | 'email' | 'telefono' | 'modelo' | 'patente' | 'dimensiones';
export default function ReservationFormScreen({ navigation, route }: Props) {
  const isSubscription = route.params.flowType === 'subscription';
  const booking = isSubscription ? undefined : route.params.booking;
  const subscriptionBooking = isSubscription ? route.params.subscriptionBooking : undefined;
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<0 | 1>(0);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [whatsappOptIn, setWhatsappOptIn] = useState(false);
  const [telefono, setTelefono] = useState('');
  const [modelo, setModelo] = useState<VehicleModel | null>(null);
  const [patente, setPatente] = useState('');
  const [dimensiones, setDimensiones] = useState('');
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const nameRef = useRef<TextInput>(null);
  const plateRef = useRef<TextInput>(null);
  const dimensionsRef = useRef<TextInput>(null);
  const scrollRef = useRef<ScrollView>(null);
  const touch = (field: Field) => setTouched(previous => ({ ...previous, [field]: true }));
  const errors: Record<Field, string> = {
    nombre: nombre.trim().length < 2 ? 'Ingresá tu nombre (al menos 2 caracteres).' : '',
    email: email.trim() && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) ? 'Ingresá un email válido.' : '',
    telefono: !/^\d{10}$/.test(telefono) ? 'Ingresá 10 dígitos: código de área y número, sin 0 ni 15.' : '',
    modelo: !modelo ? 'Seleccioná el modelo de tu vehículo.' : '',
    patente: !/^[A-Z0-9]{6,12}$/.test(patente) ? 'Ingresá entre 6 y 12 letras o números, sin espacios.' : '',
    dimensiones: modelo?.modelo === 'Otro' && !/^\d+\s*x\s*\d+\s*x\s*\d+$/i.test(dimensiones.trim()) ? 'Usá largo x ancho x alto, por ejemplo 420 x 175 x 150.' : '',
  };
  const errorFor = (field: Field) => touched[field] ? errors[field] : '';
  const goBack = () => { Keyboard.dismiss(); if (step === 1) setStep(0); else navigation.goBack(); };
  useFocusEffect(useCallback(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', () => { if (step === 1) { Keyboard.dismiss(); setStep(0); return true; } return false; });
    return () => listener.remove();
  }, [step]));
  useEffect(() => { scrollRef.current?.scrollTo({ y: 0, animated: false }); }, [step]);
  const next = () => {
    setTouched(previous => ({ ...previous, nombre: true, email: true, telefono: true }));
    if (errors.nombre) { nameRef.current?.focus(); return; }
    if (errors.email) { emailRef.current?.focus(); return; }
    if (errors.telefono) { phoneRef.current?.focus(); return; }
    Keyboard.dismiss(); setStep(1);
  };
  const pay = () => {
    setTouched({ nombre: true, email: true, telefono: true, modelo: true, patente: true, dimensiones: true });
    if (errors.nombre || errors.email || errors.telefono) { setStep(0); return; }
    if (errors.modelo) return;
    if (errors.patente) { plateRef.current?.focus(); return; }
    if (errors.dimensiones) { dimensionsRef.current?.focus(); return; }
    Keyboard.dismiss();
    const data = { nombre: nombre.trim(), email: email.trim(), whatsappOptIn, telefono: `+54${telefono}`, patente, modelo: modelo!.modelo, dimensiones: modelo!.modelo === 'Otro' ? dimensiones.trim() : modelo!.dimensiones };
    if (isSubscription && subscriptionBooking) navigation.navigate('SubscriptionPayment', { subscriptionBooking, reservation: { ...data, date: '', time: subscriptionBooking.time, duration: subscriptionBooking.duration, espacio: 1 } });
    else if (booking) navigation.navigate('Payment', { reservation: { ...booking, ...data } });
  };
  const fieldError = (field: Field) => !!errorFor(field) && <Text accessibilityLiveRegion="polite" style={styles.error}>{errorFor(field)}</Text>;
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={step === 1 ? 'Volver a contacto' : 'Volver al turno'} style={styles.back} onPress={goBack}><Text accessible={false} style={styles.arrow}>‹</Text></Pressable>
      <Text style={styles.headerTitle}>{isSubscription ? 'Datos de suscripción' : 'Datos de reserva'}</Text>
    </View>
    <KeyboardAvoidingView style={styles.sheet} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.progress}>
            {['Contacto', 'Vehículo'].map((label, index) => <View key={label} style={styles.progressItem}>
              <View style={[styles.progressLine, index <= step && styles.progressActive]} />
              <Text style={[styles.progressLabel, index === step && styles.progressCurrent]} accessibilityLabel={`Paso ${index + 1} de 2: ${label}${index === step ? ', actual' : ''}`}>{index + 1}. {label}</Text>
            </View>)}
          </View>
          <View style={styles.intro}>
            <Text accessibilityRole="header" style={styles.title}>{step === 0 ? '¿Para quién es la reserva?' : 'Contanos sobre tu vehículo'}</Text>
            <Text style={styles.description}>{step === 0 ? 'Completá tus datos de contacto para la reserva.' : 'Elegí el modelo e ingresá la patente.'}</Text>
          </View>
          {step === 0 ? <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre completo</Text>
              <TextInput ref={nameRef} style={[styles.input, !!errorFor('nombre') && styles.invalid]} accessibilityLabel="Nombre completo" placeholderTextColor="#687991"
                value={nombre} onChangeText={setNombre} onBlur={() => touch('nombre')} maxLength={100} autoComplete="name" textContentType="name" autoCapitalize="words" returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => emailRef.current?.focus()} />
              {fieldError('nombre')}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email (opcional)</Text>
              <TextInput ref={emailRef} accessibilityLabel="Email, opcional" style={[styles.input, !!errorFor('email') && styles.invalid]}
                value={email} onChangeText={setEmail} onBlur={() => touch('email')} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                autoComplete="email" textContentType="emailAddress" maxLength={254} returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => phoneRef.current?.focus()} />
              {fieldError('email')}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>WhatsApp</Text>
              <View style={[styles.phone, !!errorFor('telefono') && styles.invalid]}>
                <Text style={styles.prefix}>+54</Text>
                <TextInput ref={phoneRef} style={styles.phoneInput} accessibilityLabel="WhatsApp, código de área y número sin 0 ni 15" placeholder="351 123 4567" placeholderTextColor="#687991" keyboardType="phone-pad" autoComplete="tel-national" textContentType="telephoneNumber"
                  value={telefono} onBlur={() => touch('telefono')} maxLength={20} returnKeyType="done" onSubmitEditing={next}
                  onChangeText={text => { let digits = text.replace(/\D/g, ''); if (digits.length > 10 && digits.startsWith('54')) digits = digits.slice(2); if (digits.length === 11 && digits.startsWith('9')) digits = digits.slice(1); setTelefono(digits); }} />
              </View>
              <Text style={styles.hint}>Código de área + número, sin 0 ni 15.</Text>
              {fieldError('telefono')}
              <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: whatsappOptIn }} onPress={() => setWhatsappOptIn(value => !value)} style={styles.optIn}>
                <View style={[styles.checkbox, whatsappOptIn && styles.checkboxSelected]}>{whatsappOptIn && <Text style={styles.checkmark}>✓</Text>}</View>
                <Text style={styles.optInLabel}>Quiero recibir el código y la confirmación de esta reserva por WhatsApp.</Text>
              </Pressable>
            </View>
          </View> : <>
            <View style={styles.contactSummary}>
              <View style={styles.summaryText}><Text style={styles.summaryName}>{nombre.trim()}</Text><Text style={styles.hint}>+54 {telefono}</Text>{!!email.trim() && <Text style={styles.hint}>{email.trim()}</Text>}</View>
              <Pressable accessibilityRole="button" accessibilityLabel="Editar datos de contacto" style={styles.edit} onPress={() => setStep(0)}><Text style={styles.editLabel}>Editar</Text></Pressable>
            </View>
            <View style={styles.fields}>
              <View style={styles.field}>
                <Text style={styles.label}>Modelo</Text>
                <VehicleModelPicker value={modelo} error={errorFor('modelo')} onChange={value => { setModelo(value); touch('modelo'); if (value.modelo !== 'Otro') setDimensiones(''); }} />
                {fieldError('modelo')}
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Patente</Text>
                <TextInput ref={plateRef} accessibilityLabel="Patente del vehículo" style={[styles.input, styles.plate, !!errorFor('patente') && styles.invalid]} placeholder="Patente o patente provisional" placeholderTextColor="#687991"
                  value={patente} autoCapitalize="characters" autoCorrect={false} maxLength={12} onChangeText={text => setPatente(text.toUpperCase().replace(/[^A-Z0-9]/g, ''))} onBlur={() => touch('patente')}
                  returnKeyType={modelo?.modelo === 'Otro' ? 'next' : 'done'} onSubmitEditing={() => modelo?.modelo === 'Otro' ? dimensionsRef.current?.focus() : pay()} />
                {fieldError('patente')}
              </View>
              {modelo?.modelo === 'Otro' && <View style={styles.field}>
                <Text style={styles.label}>Dimensiones aproximadas (cm)</Text>
                <TextInput ref={dimensionsRef} accessibilityLabel="Largo por ancho por alto en centímetros" style={[styles.input, !!errorFor('dimensiones') && styles.invalid]} placeholder="420 x 175 x 150" placeholderTextColor="#687991"
                  value={dimensiones} onChangeText={setDimensiones} onBlur={() => touch('dimensiones')} maxLength={40} autoCapitalize="none" returnKeyType="done" onSubmitEditing={pay} />
                <Text style={styles.hint}>Largo × ancho × alto. Solo para vehículos fuera de la lista.</Text>
                {fieldError('dimensiones')}
              </View>}
            </View>
          </>}
          <View style={styles.actions}>
            <ActionButton surface="light" label={step === 0 ? 'Continuar' : 'Ir a pagar'} onPress={step === 0 ? next : pay} accessibilityHint={step === 0 ? 'Continuá con los datos del vehículo' : 'Revisá tu reserva antes de realizar el pago'} />
            <Text style={styles.footnote}>{step === 0 ? 'Paso 1 de 2 · Tus datos se mantienen al volver.' : 'Podés revisar el resumen antes de pagar.'}</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  </View>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.blue },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingBottom: 20 },
  back: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.14)' },
  arrow: { fontSize: 36, lineHeight: 40, marginTop: -3, color: '#FFFFFF' },
  headerTitle: { flex: 1, fontSize: 26, lineHeight: 34, fontWeight: '700', color: '#FFFFFF' },
  sheet: { flex: 1, backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 32, alignItems: 'center' },
  content: { width: '100%', maxWidth: 480, gap: 24 },
  progress: { flexDirection: 'row', gap: 12 },
  progressItem: { flex: 1, gap: 8 },
  progressLine: { height: 4, borderRadius: 2, backgroundColor: '#E2E9F4' },
  progressActive: { backgroundColor: colors.blue },
  progressLabel: { fontSize: 13, lineHeight: 20, color: colors.label },
  progressCurrent: { fontWeight: '700', color: colors.blue },
  intro: { gap: 8 },
  title: { fontSize: 24, lineHeight: 32, fontWeight: '700', color: colors.ink },
  description: { fontSize: 15, lineHeight: 22, color: colors.label },
  fields: { gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 16, lineHeight: 24, fontWeight: '600', color: colors.ink },
  input: { minHeight: 56, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1, borderColor: '#CCD8E9', backgroundColor: '#F8FAFE', fontSize: 17, lineHeight: 24, color: colors.ink },
  invalid: { borderColor: '#AD2936' },
  phone: { minHeight: 56, flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, borderColor: '#CCD8E9', backgroundColor: '#F8FAFE', paddingHorizontal: 16, gap: 12 },
  prefix: { fontSize: 17, lineHeight: 24, fontWeight: '600', color: colors.ink },
  phoneInput: { flex: 1, minHeight: 56, paddingVertical: 14, fontSize: 17, lineHeight: 24, color: colors.ink },
  plate: { letterSpacing: 1 },
  hint: { fontSize: 13, lineHeight: 20, color: colors.label },
  error: { color: '#AD2936', fontSize: 13, lineHeight: 20 },
  contactSummary: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, backgroundColor: '#EFF4FC', borderRadius: 18 },
  summaryText: { flex: 1, gap: 2 },
  summaryName: { fontSize: 15, lineHeight: 22, fontWeight: '600', color: colors.ink },
  edit: { minHeight: 48, paddingHorizontal: 8, justifyContent: 'center' },
  editLabel: { color: colors.blue, fontWeight: '600', fontSize: 15 },
  actions: { alignItems: 'center', gap: 12, paddingTop: 4 },
  optIn: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 8 },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: colors.blue, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.blue },
  checkmark: { color: '#FFFFFF', fontWeight: '700' },
  optInLabel: { flex: 1, fontSize: 14, lineHeight: 22, color: colors.label },
  footnote: { color: colors.label, fontSize: 13, lineHeight: 20, textAlign: 'center' },
});
