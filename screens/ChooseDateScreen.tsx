import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseDate'>;

export default function ChooseDateScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Elegir Fecha</Text>
      <Text style={styles.subtitle}>Selecciona el día y hora para tu turno</Text>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📅 Calendario aquí</Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ReservationForm')}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  placeholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  placeholderText: {
    fontSize: 18,
    color: '#999',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

