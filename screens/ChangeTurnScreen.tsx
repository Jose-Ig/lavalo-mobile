import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangeTurn'>;

export default function ChangeTurnScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cambiar Turno</Text>
      <Text style={styles.subtitle}>Selecciona una nueva fecha y hora</Text>

      <View style={styles.currentTurn}>
        <Text style={styles.currentLabel}>Turno actual:</Text>
        <Text style={styles.currentValue}>15 de Enero, 2025 - 10:00 AM</Text>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📅 Selector de nueva fecha aquí</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Success')}
        >
          <Text style={styles.buttonText}>Confirmar Cambio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
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
  currentTurn: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  currentLabel: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E65100',
  },
  placeholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  placeholderText: {
    fontSize: 18,
    color: '#999',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});

