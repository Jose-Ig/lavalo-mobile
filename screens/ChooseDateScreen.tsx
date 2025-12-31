import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import CircleBookingSelector, { BookingSelection } from '../src/components/CircleBookingSelector';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseDate'>;

export default function ChooseDateScreen({ navigation }: Props) {
  const [selection, setSelection] = useState<BookingSelection | null>(null);

  const handleSelectionChange = (newSelection: BookingSelection) => {
    setSelection(newSelection);
    console.log('Selección:', newSelection);
  };

  return (
    <ScrollView 
      style={styles.scrollView}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>Reservá tu lugar</Text>

      <CircleBookingSelector
        onChange={handleSelectionChange}
        defaultDuration={60}
      />

      <TouchableOpacity
        style={[styles.button, !selection && styles.buttonDisabled]}
        onPress={() => {
          if (selection) {
            navigation.navigate('ReservationForm', { booking: selection });
          }
        }}
        disabled={!selection}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fbfaf9',
  },
  container: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 45,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#178fe5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 45,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
