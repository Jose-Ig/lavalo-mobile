import type { TextInputInstance } from 'react-native';
import React, { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import ActionButton from '../src/components/ActionButton';
import { homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'ReservationForm'>;
type Field = 'nombre' | 'apellido' | 'codigoArea' | 'telefono' | 'email';
export default function ReservationFormScreen({ navigation, route }: Props) {
  const isSubscription = route.params.flowType === 'subscription';
  const booking = isSubscription ? undefined : route.params.booking;
  const subscriptionBooking = isSubscription ? route.params.subscriptionBooking : undefined;
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [codigoArea, setCodigoArea] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const lastNameRef = useRef<TextInputInstance>(null);
  const areaRef = useRef<TextInputInstance>(null);
  const emailRef = useRef<TextInputInstance>(null);
  const phoneRef = useRef<TextInputInstance>(null);
  const nameRef = useRef<TextInputInstance>(null);
  const touch = (field: Field) => setTouched(previous => ({ ...previous, [field]: true }));
  const errors: Record<Field, string> = {
    nombre: !nombre.trim() ? 'Ingresá tu nombre.' : '',
    apellido: !apellido.trim() ? 'Ingresá tu apellido.' : '',
    codigoArea: !/^[1-9]\d{1,3}$/.test(codigoArea) ? 'Ingresá el código de área sin 0 (por ejemplo, 351).' : '',
    email: (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) ? 'Ingresá un email válido.' : '',
    telefono: !/^\d+$/.test(telefono) || (codigoArea + telefono).length !== 10 ? 'El código de área y el número deben sumar 10 dígitos, sin 0 ni 15.' : '',
  };
  const errorFor = (field: Field) => touched[field] ? errors[field] : '';
  const goBack = () => { Keyboard.dismiss(); navigation.goBack(); };
  const pay = () => {
    setTouched({ nombre: true, apellido: true, codigoArea: true, telefono: true, email: true });
    if (errors.nombre) { nameRef.current?.focus(); return; }
    if (errors.apellido) { lastNameRef.current?.focus(); return; }
    if (errors.codigoArea) { areaRef.current?.focus(); return; }
    if (errors.telefono) { phoneRef.current?.focus(); return; }
    if (errors.email) { emailRef.current?.focus(); return; }
    Keyboard.dismiss();
    const data = { nombre: nombre.trim(), apellido: apellido.trim(), codigoArea, email: email.trim(), telefono: `+54${codigoArea}${telefono}` };
    if (isSubscription && subscriptionBooking) navigation.navigate('SubscriptionPayment', { subscriptionBooking, reservation: { ...data, date: '', time: subscriptionBooking.time, duration: subscriptionBooking.duration, espacio: 1 } });
    else if (booking) navigation.navigate('Payment', { reservation: { ...booking, ...data } });
  };
  const fieldError = (field: Field) => !!errorFor(field) && <Text accessibilityLiveRegion="polite" style={styles.error}>{errorFor(field)}</Text>;
  return <View style={styles.root}>
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="Volver al turno" style={styles.back} onPress={goBack}><Text accessible={false} style={styles.arrow}>‹</Text></Pressable>
      <Text style={styles.headerTitle}>{isSubscription ? 'Datos de suscripción' : 'Datos de reserva'}</Text>
    </View>
    <KeyboardAvoidingView style={styles.sheet} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.intro}>
            <Text accessibilityRole="header" style={styles.title}>¿Para quién es la reserva?</Text>
            <Text style={styles.description}>Completá tus datos de contacto para reservar y realizar el pago.</Text>
          </View>
          <View style={styles.fields}>
            <View style={styles.field}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput ref={nameRef} style={[styles.input, !!errorFor('nombre') && styles.invalid]} accessibilityLabel="Nombre" placeholderTextColor="#687991"
                value={nombre} onChangeText={setNombre} onBlur={() => touch('nombre')} maxLength={100} autoComplete="given-name" textContentType="givenName" autoCapitalize="words" returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => lastNameRef.current?.focus()} />
              {fieldError('nombre')}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Apellido</Text>
              <TextInput ref={lastNameRef} accessibilityLabel="Apellido" style={[styles.input, !!errorFor('apellido') && styles.invalid]}
                value={apellido} onChangeText={setApellido} onBlur={() => touch('apellido')} maxLength={100} autoComplete="family-name" textContentType="familyName" autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => areaRef.current?.focus()} />
              {fieldError('apellido')}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Código de área</Text>
              <TextInput ref={areaRef} accessibilityLabel="Código de área sin cero" placeholder="351" placeholderTextColor="#687991" style={[styles.input, !!errorFor('codigoArea') && styles.invalid]}
                value={codigoArea} onChangeText={text => setCodigoArea(text.replace(/\D/g, ''))} onBlur={() => touch('codigoArea')} keyboardType="phone-pad" maxLength={4} returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} />
              <Text style={styles.hint}>Sin el 0 inicial. Por ejemplo: 11, 351 o 2954.</Text>
              {fieldError('codigoArea')}
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Teléfono celular</Text>
              <View style={[styles.phone, !!errorFor('telefono') && styles.invalid]}>
                <Text style={styles.prefix}>+54 {codigoArea}</Text>
                <TextInput ref={phoneRef} style={styles.phoneInput} accessibilityLabel="Número de celular sin código de área ni 15" placeholder="123 4567" placeholderTextColor="#687991" keyboardType="phone-pad" autoComplete="off"
                  value={telefono} onBlur={() => touch('telefono')} maxLength={8} returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
                  onChangeText={text => setTelefono(text.replace(/\D/g, ''))} />
              </View>
              <Text style={styles.hint}>Número local, sin el 15. Completá el código de área en el campo anterior.</Text>
              {fieldError('telefono')}
              <Text style={styles.hint}>Enviaremos por WhatsApp tu código de confirmación de turno.</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput ref={emailRef} accessibilityLabel="Email" style={[styles.input, !!errorFor('email') && styles.invalid]}
                value={email} onChangeText={setEmail} onBlur={() => touch('email')} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                autoComplete="email" textContentType="emailAddress" maxLength={254} returnKeyType="done" onSubmitEditing={pay} />
              <Text style={styles.hint}>Usamos tu email para identificar el pago en Mercado Pago.</Text>
              {fieldError('email')}
            </View>
          </View>
          <View style={styles.actions}>
            <ActionButton surface="light" label="Ir a pagar" onPress={pay} accessibilityHint="Revisá tu reserva antes de realizar el pago" />
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
  hint: { fontSize: 13, lineHeight: 20, color: colors.label },
  error: { color: '#AD2936', fontSize: 13, lineHeight: 20 },
  actions: { alignItems: 'center', gap: 12, paddingTop: 4 },
});
