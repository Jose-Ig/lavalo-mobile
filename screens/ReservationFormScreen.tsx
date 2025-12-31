import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ReservationForm'>;

export default function ReservationFormScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Datos de Reserva</Text>
      <Text style={styles.subtitle}>Completa tus datos para continuar</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          placeholderTextColor="#999"
        />
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          placeholderTextColor="#999"
          keyboardType="phone-pad"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Patente del vehículo"
          placeholderTextColor="#999"
          autoCapitalize="characters"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Payment')}
      >
        <Text style={styles.buttonText}>Ir a Pagar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    gap: 16,
    marginBottom: 40,
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

