import type { TextInputInstance } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReservationData } from '../../App';
import ActionButton from './ActionButton';
import CircleBookingSelector, { type BookingSelection } from './CircleBookingSelector';
import { apiErrorMessage, getAvailableSlots, type Slot } from '../services/api';
import { homeTheme as colors } from '../theme/home';

type Props = { section: 'turn' | 'contact'; value: ReservationData; onSave: (value: ReservationData) => void; onClose: () => void };
export default function ReservationEditor({ section, value, onSave, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState(value.nombre);
  const [apellido, setApellido] = useState(value.apellido || "");
  const [codigoArea, setCodigoArea] = useState(value.codigoArea || "");
  const [email, setEmail] = useState(value.email || '');
  const [phone, setPhone] = useState(value.telefono.replace(/^\+54/, '').slice(value.codigoArea?.length || 0));
  const [submitted, setSubmitted] = useState(false);
  const [selection, setSelection] = useState<BookingSelection | null>(value);
  const [availability, setAvailability] = useState<{ key: string; slots: Slot[]; error: string }>({ key: '', slots: [], error: '' });
  const lastNameRef = useRef<TextInputInstance>(null);
  const areaRef = useRef<TextInputInstance>(null);
  const nameRef = useRef<TextInputInstance>(null);
  const emailRef = useRef<TextInputInstance>(null);
  const phoneRef = useRef<TextInputInstance>(null);
  const key = selection ? `${selection.date}/${selection.time}/${selection.duration}` : '';
  useEffect(() => {
    if (section !== 'turn' || !selection) return;
    let active = true;
    getAvailableSlots(selection.date, selection.time, selection.duration).then(slots => {
      if (!active) return;
      setAvailability({ key, slots, error: '' });
    }).catch(error => { if (active) setAvailability({ key, slots: [], error: apiErrorMessage(error) }); });
    return () => { active = false; };
  }, [key, section]);
  const loading = !!selection && availability.key !== key;
  const slots = availability.key === key ? availability.slots : [];
  const errors = {
    name: !nombre.trim() ? 'Ingresá tu nombre.' : '',
    lastName: !apellido.trim() ? 'Ingresá tu apellido.' : '',
    area: !/^[1-9]\d{1,3}$/.test(codigoArea) ? 'Ingresá el código de área sin 0.' : '',
    email: (email.trim().length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) ? 'Ingresá un email válido.' : '',
    phone: !/^\d+$/.test(phone) || (codigoArea + phone).length !== 10 ? 'El código de área y el número deben sumar 10 dígitos, sin 0 ni 15.' : '',
  };
  const save = () => {
    if (section === 'contact') {
      setSubmitted(true);
      if (errors.name) { nameRef.current?.focus(); return; }
      if (errors.lastName) { lastNameRef.current?.focus(); return; }
      if (errors.area) { areaRef.current?.focus(); return; }
      if (errors.phone) { phoneRef.current?.focus(); return; }
      if (errors.email) { emailRef.current?.focus(); return; }
      Keyboard.dismiss(); onSave({ ...value, nombre: nombre.trim(), apellido: apellido.trim(), codigoArea, email: email.trim(), telefono: `+54${codigoArea}${phone}` });
    } else if (selection && slots.length > 0 && !loading) {
      onSave({ ...value, ...selection, espacio: 0, espacioLabel: undefined });
    }
  };
  return <Modal visible animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.title} accessibilityRole="header">{section === 'turn' ? 'Editar turno' : 'Editar contacto'}</Text>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancel}><Text style={styles.cancelLabel}>Cancelar</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
        <View style={styles.content}>
          {section === 'contact' ? <>
            <View style={styles.field}><Text style={styles.label}>Nombre</Text>
              <TextInput ref={nameRef} accessibilityLabel="Nombre" style={[styles.input, submitted && !!errors.name && styles.invalid]} value={nombre} onChangeText={setNombre} maxLength={100} autoComplete="given-name" textContentType="givenName" autoCapitalize="words" returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => lastNameRef.current?.focus()} />
              {submitted && !!errors.name && <Text style={styles.error}>{errors.name}</Text>}
            </View>
            <View style={styles.field}><Text style={styles.label}>Apellido</Text>
              <TextInput ref={lastNameRef} accessibilityLabel="Apellido" style={[styles.input, submitted && !!errors.lastName && styles.invalid]} value={apellido} onChangeText={setApellido} maxLength={100} autoComplete="family-name" textContentType="familyName" autoCapitalize="words" returnKeyType="next" onSubmitEditing={() => areaRef.current?.focus()} />
              {submitted && !!errors.lastName && <Text style={styles.error}>{errors.lastName}</Text>}
            </View>
            <View style={styles.field}><Text style={styles.label}>Teléfono celular</Text>
              <View style={[styles.phone, submitted && (!!errors.phone || !!errors.area) && styles.invalid]}><Text style={styles.label}>+54</Text>
                <TextInput ref={areaRef} accessibilityLabel="Código de área sin cero" placeholder="351" style={styles.areaInput} value={codigoArea} onChangeText={text => setCodigoArea(text.replace(/\D/g, ''))} maxLength={4} keyboardType="phone-pad" returnKeyType="next" onSubmitEditing={() => phoneRef.current?.focus()} />
                <TextInput ref={phoneRef} accessibilityLabel="Número de celular sin código de área ni 15" style={styles.phoneInput} value={phone} keyboardType="phone-pad" autoComplete="off" maxLength={8} returnKeyType="next" onSubmitEditing={() => emailRef.current?.focus()}
                  onChangeText={text => setPhone(text.replace(/\D/g, ''))} />
              </View>
              <Text style={styles.hint}>Código de área + número, sin 0 ni 15.</Text>
              {submitted && !!errors.area && <Text style={styles.error}>{errors.area}</Text>}
              {submitted && !!errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
            </View>
            <Text style={styles.hint}>Enviaremos por WhatsApp tu código de confirmación de turno.</Text>
            <View style={styles.field}><Text style={styles.label}>Email</Text>
              <TextInput ref={emailRef} accessibilityLabel="Email" style={[styles.input, submitted && !!errors.email && styles.invalid]}
                value={email} onChangeText={setEmail} maxLength={254} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
                autoComplete="email" textContentType="emailAddress" returnKeyType="done" onSubmitEditing={save} />
              <Text style={styles.hint}>También enviaremos tu código de confirmación de turno por email.</Text>
              {submitted && !!errors.email && <Text style={styles.error}>{errors.email}</Text>}
            </View>
          </> : <>
            <CircleBookingSelector initialSelection={value} defaultDuration={value.duration} onChange={setSelection} />
            <View style={styles.spaceCard}>
              {!selection ? <Text style={styles.hint}>Elegí un turno con horarios disponibles.</Text> : loading ? <ActivityIndicator color={colors.blue} /> : availability.error ?
                <Text accessibilityRole="alert" style={styles.error}>{availability.error}</Text> : !slots.length ? <Text accessibilityLiveRegion="polite" style={styles.error}>No hay disponibilidad para este turno.</Text> : <Text style={styles.hint}>Hay disponibilidad para este turno.</Text>}

            </View>
          </>}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <ActionButton surface="light" label="Guardar cambios" disabled={section === 'turn' && (!selection || loading || !slots.length || !!availability.error)} onPress={save} />
      </View>
    </KeyboardAvoidingView>
  </Modal>;
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingBottom: 16 },
  title: { flex: 1, fontSize: 24, lineHeight: 32, fontWeight: '700', color: colors.ink },
  cancel: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  cancelLabel: { color: colors.blue, fontSize: 16, fontWeight: '600' },
  scroll: { padding: 24, alignItems: 'center' },
  content: { width: '100%', maxWidth: 480, gap: 24 },
  field: { gap: 8 },
  label: { color: colors.ink, fontSize: 16, lineHeight: 24, fontWeight: '600' },
  input: { minHeight: 56, padding: 16, fontSize: 17, color: colors.ink, borderWidth: 1, borderColor: '#CCD8E9', borderRadius: 16, backgroundColor: '#F8FAFE' },
  invalid: { borderColor: '#AD2936' },
  phone: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingHorizontal: 16, minHeight: 56, borderWidth: 1, borderColor: '#CCD8E9', borderRadius: 16, backgroundColor: '#F8FAFE' },
  areaInput: { width: 60, minHeight: 56, fontSize: 17, color: colors.ink, borderRightWidth: 1, borderRightColor: '#CCD8E9', paddingRight: 8 },
  phoneInput: { flex: 1, minHeight: 56, fontSize: 17, color: colors.ink },
  hint: { color: colors.label, fontSize: 14, lineHeight: 22 },
  error: { color: '#AD2936', fontSize: 14, lineHeight: 22 },
  spaceCard: { borderRadius: 24, padding: 20, gap: 16, backgroundColor: '#EFF4FC' },
  footer: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#DCE6F7' },
});
