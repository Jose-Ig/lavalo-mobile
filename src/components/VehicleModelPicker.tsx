import React, { useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { VEHICLE_MODELS_WITH_OTHER, type VehicleModel } from '../data/vehicleModels';
import { homeTheme as colors } from '../theme/home';

type Props = { value: VehicleModel | null; onChange: (model: VehicleModel) => void; error?: string };
const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export default function VehicleModelPicker({ value, onChange, error }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const input = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const results = useMemo(() => VEHICLE_MODELS_WITH_OTHER.filter(model => model.modelo !== 'Otro' && normalize(model.modelo).includes(normalize(search))), [search]);
  const choose = (model: VehicleModel) => { onChange(model); setOpen(false); };
  return <>
    <Pressable accessibilityRole="button" accessibilityLabel="Modelo del vehículo" accessibilityValue={{ text: value?.modelo || 'Sin seleccionar' }} accessibilityHint="Abrí el buscador de modelos"
      style={({ pressed }) => [styles.field, !!error && styles.invalid, pressed && styles.pressed]} onPress={() => { setSearch(''); setOpen(true); }}>
      <Text style={[styles.value, !value && styles.placeholder]}>{value?.modelo || 'Buscar marca o modelo'}</Text>
      <Svg accessible={false} width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="m9 6 6 6-6 6" stroke={colors.blue} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
    </Pressable>
    <Modal visible={open} animationType="slide" onRequestClose={() => setOpen(false)} onShow={() => input.current?.focus()}>
      <KeyboardAvoidingView style={styles.modal} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={[styles.modalHeader, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title} accessibilityRole="header">Buscá tu vehículo</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Cerrar buscador" onPress={() => setOpen(false)} style={styles.close}><Text style={styles.closeLabel}>Cerrar</Text></Pressable>
        </View>
        <View style={styles.searchArea}>
          <TextInput ref={input} accessibilityLabel="Buscar marca o modelo" value={search} onChangeText={setSearch} placeholder="Por ejemplo, Renault Clio" placeholderTextColor="#687991"
            style={styles.searchInput} autoCorrect={false} autoCapitalize="none" returnKeyType="search" clearButtonMode="while-editing" />
        </View>
        <FlatList data={results} keyExtractor={model => model.modelo} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" initialNumToRender={12}
          ListEmptyComponent={<Text style={styles.empty}>No encontramos ese modelo. Podés elegir “Otro vehículo”.</Text>}
          renderItem={({ item }) => <Pressable accessibilityRole="button" accessibilityState={{ selected: value?.modelo === item.modelo }} onPress={() => choose(item)}
            android_ripple={{ color: '#D9E6FF' }} style={({ pressed }) => [styles.result, value?.modelo === item.modelo && styles.selected, pressed && styles.pressed]}>
            <Text style={styles.resultLabel}>{item.modelo}</Text>
          </Pressable>} />
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable accessibilityRole="button" style={styles.other} onPress={() => choose({ modelo: 'Otro', dimensiones: '' })}>
            <Text style={styles.closeLabel}>Otro vehículo / No encuentro mi modelo</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  field: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#CCD8E9', backgroundColor: '#F8FAFE' },
  value: { flex: 1, fontSize: 17, lineHeight: 24, color: colors.ink },
  placeholder: { color: '#687991' },
  invalid: { borderColor: '#AD2936' },
  pressed: { opacity: 0.75 },
  modal: { flex: 1, backgroundColor: '#FFFFFF' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingBottom: 12 },
  title: { flex: 1, fontSize: 24, lineHeight: 32, fontWeight: '700', color: colors.ink },
  close: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 8 },
  closeLabel: { color: colors.blue, fontSize: 16, lineHeight: 24, fontWeight: '600', textAlign: 'center' },
  searchArea: { paddingHorizontal: 24, paddingBottom: 12 },
  searchInput: { minHeight: 56, padding: 16, fontSize: 17, color: colors.ink, backgroundColor: '#EFF4FC', borderRadius: 16 },
  result: { minHeight: 56, paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E1E8F4' },
  resultLabel: { fontSize: 17, lineHeight: 24, color: colors.ink },
  selected: { backgroundColor: '#E4EDFC' },
  empty: { padding: 24, color: colors.label, fontSize: 16, lineHeight: 24 },
  footer: { paddingHorizontal: 24, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderColor: '#D8E1EF' },
  other: { minHeight: 56, justifyContent: 'center', padding: 14, borderRadius: 28, backgroundColor: '#E4EDFC' },
});
