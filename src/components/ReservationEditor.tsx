import type { TextInputInstance } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReservationData } from '../../App';
import ActionButton from './ActionButton';
import CircleBookingSelector, { type BookingSelection } from './CircleBookingSelector';
import SpaceDropdown from './SpaceDropdown';
import { apiErrorMessage, getAvailableSlots, type Slot } from '../services/api';
import { homeTheme as colors } from '../theme/home';

type Props = { section: 'turn' | 'contact'; value: ReservationData; onSave: (value: ReservationData) => void; onClose: () => void };
export default function ReservationEditor({ section, value, onSave, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [nombre, setNombre] = useState(value.nombre);
  const [whatsappOptIn, setWhatsappOptIn] = useState(value.whatsappOptIn === true);
  const [phone, setPhone] = useState(value.telefono.replace(/^\+54/, ''));
  const [submitted, setSubmitted] = useState(false);
  const [selection, setSelection] = useState<BookingSelection | null>(value);
  const [space, setSpace] = useState<number | null>(value.espacio);
  const [availability, setAvailability] = useState<{ key: string; slots: Slot[]; error: string }>({ key: '', slots: [], error: '' });
  const nameRef = useRef<TextInputInstance>(null);
  const phoneRef = useRef<TextInputInstance>(null);
  const key = selection ? `${selection.date}/${selection.time}/${selection.duration}` : '';
  useEffect(() => {
    if (section !== 'turn' || !selection) return;
    let active = true;
    getAvailableSlots(selection.date, selection.time, selection.duration).then(slots => {
      if (!active) return;
      setSpace(previous => slots.some(slot => slot.id === previous) ? previous : null);
      setAvailability({ key, slots, error: '' });
    }).catch(error => { if (active) setAvailability({ key, slots: [], error: apiErrorMessage(error) }); });
    return () => { active = false; };
  }, [key, section]);
  const loading = !!selection && availability.key !== key;
  const slots = availability.key === key ? availability.slots : [];
  const selectedSpace = slots.find(slot => slot.id === space);
  const errors = {
    name: nombre.trim().length < 2 ? 'Ingresá al menos 2 caracteres.' : '',
    phone: !/^\d{10}$/.test(phone) ? 'Ingresá 10 dígitos, sin 0 ni 15.' : '',
  };
  const save = () => {
    if (section === 'contact') {
      setSubmitted(true);
      if (errors.name) { nameRef.current?.focus(); return; }
      if (errors.phone) { phoneRef.current?.focus(); return; }
      Keyboard.dismiss(); onSave({ ...value, nombre: nombre.trim(), whatsappOptIn, telefono: `+54${phone}` });
    } else if (selection && selectedSpace && !loading) {
      onSave({ ...value, ...selection, espacio: selectedSpace.id, espacioLabel: selectedSpace.label });
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
            <View style={styles.field}><Text style={styles.label}>Nombre completo</Text>
              <TextInput ref={nameRef} accessibilityLabel="Nombre completo" style={[styles.input, submitted && !!errors.name && styles.invalid]} value={nombre} onChangeText={setNombre} maxLength={100} autoComplete="name" autoCapitalize="words" returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => phoneRef.current?.focus()} />
              {submitted && !!errors.name && <Text style={styles.error}>{errors.name}</Text>}
            </View>
            <View style={styles.field}><Text style={styles.label}>Teléfono celular</Text>
              <View style={[styles.phone, submitted && !!errors.phone && styles.invalid]}><Text style={styles.label}>+54</Text>
                <TextInput ref={phoneRef} accessibilityLabel="Teléfono celular sin 0 ni 15" style={styles.phoneInput} value={phone} keyboardType="phone-pad" autoComplete="tel-national" maxLength={20} returnKeyType="done" onSubmitEditing={save}
                  onChangeText={text => { let digits = text.replace(/\D/g, ''); if (digits.length > 10 && digits.startsWith('54')) digits = digits.slice(2); if (digits.length === 11 && digits.startsWith('9')) digits = digits.slice(1); setPhone(digits); }} />
              </View>
              <Text style={styles.hint}>Código de área + número, sin 0 ni 15. El código de reserva se envía por SMS.</Text>
              {submitted && !!errors.phone && <Text style={styles.error}>{errors.phone}</Text>}
            </View>
            <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: whatsappOptIn }} onPress={() => setWhatsappOptIn(previous => !previous)} style={styles.optIn}>
              <View style={[styles.checkbox, whatsappOptIn && styles.checkboxSelected]}>{whatsappOptIn && <Text style={styles.checkmark}>✓</Text>}</View>
              <Text style={styles.optInLabel}>Quiero recibir también el código y la confirmación por WhatsApp.</Text>
            </Pressable>
          </> : <>
            <CircleBookingSelector initialSelection={value} defaultDuration={value.duration} onChange={setSelection} />
            <View style={styles.spaceCard}><Text style={styles.label}>Elegí tu espacio</Text>
              {!selection ? <Text style={styles.hint}>Elegí un turno con horarios disponibles.</Text> : loading ? <ActivityIndicator color={colors.blue} /> : availability.error ?
                <Text accessibilityRole="alert" style={styles.error}>{availability.error}</Text> : !slots.length ? <Text style={styles.hint}>No hay espacios disponibles. Elegí otro turno.</Text> : <>
                  <SpaceDropdown slots={slots} value={space} onChange={setSpace} />
                  {!selectedSpace && <Text style={styles.hint}>Elegí un espacio disponible para este turno.</Text>}
                </>}
            </View>
          </>}
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <ActionButton surface="light" label="Guardar cambios" disabled={section === 'turn' && (!selection || loading || !selectedSpace || !!availability.error)} onPress={save} />
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
  phoneInput: { flex: 1, minHeight: 56, fontSize: 17, color: colors.ink },
  hint: { color: colors.label, fontSize: 14, lineHeight: 22 },
  error: { color: '#AD2936', fontSize: 14, lineHeight: 22 },
  spaceCard: { borderRadius: 24, padding: 20, gap: 16, backgroundColor: '#EFF4FC' },
  optIn: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48 },
  checkbox: { width: 24, height: 24, borderWidth: 1, borderColor: colors.blue, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  checkboxSelected: { backgroundColor: colors.blue },
  checkmark: { color: '#FFFFFF', fontWeight: '700' },
  optInLabel: { flex: 1, fontSize: 14, lineHeight: 22, color: colors.label },
  footer: { alignItems: 'center', paddingHorizontal: 24, paddingTop: 16, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#DCE6F7' },
});
