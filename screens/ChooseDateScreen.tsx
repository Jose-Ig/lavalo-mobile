import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import CircleBookingSelector, { BookingSelection } from '../src/components/CircleBookingSelector';

import { Picker } from '@react-native-picker/picker';
import { getAvailableSlots, apiErrorMessage, Slot } from '../src/services/api';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseDate'>;

export default function ChooseDateScreen({ navigation }: Props) {
  const [selection, setSelection] = useState<BookingSelection | null>(null);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotId, setSlotId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setSlots([]); setSlotId(null); setError('');
    if (!selection) { setLoading(false); return; }
    setLoading(true);
    getAvailableSlots(selection.date, selection.time, selection.duration)
      .then(items => { if (active) { setSlots(items); setSlotId(items[0]?.id ?? null); } })
      .catch(e => { if (active) setError(apiErrorMessage(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selection?.date, selection?.time, selection?.duration]);
  const ready = !!selection && slotId !== null && !loading && !error;
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reservá tu lugar</Text>
      </View>

      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <CircleBookingSelector
            onChange={(s) => setSelection(s)}
            defaultDuration={60}
          />

          <Text>{loading ? 'Consultando espacios…' : error || (!slots.length ? 'No hay espacios disponibles para este turno.' : 'Elegí tu espacio')}</Text>
          {slots.length > 0 && <Picker selectedValue={slotId} onValueChange={value => setSlotId(Number(value))}>
            {slots.map(slot => <Picker.Item key={slot.id} label={slot.label} value={slot.id} />)}
          </Picker>}
          <TouchableOpacity
            style={[styles.button, !ready && styles.buttonDisabled]}
            onPress={() => {
              if (selection && ready && slotId !== null) {
                navigation.navigate('ReservationForm', { booking: { ...selection, espacio: slotId } });
              }
            }}
            disabled={!ready}
          >
            <Text style={styles.buttonText}>Continuar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#4170be',
  },
  header: {
    backgroundColor: '#4170be',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    gap: 8,
  },
  backButton: {
    padding: 4,
  },
  backArrow: {
    fontSize: 40,
    color: '#fff',
    lineHeight: 40,
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 32,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 64,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
