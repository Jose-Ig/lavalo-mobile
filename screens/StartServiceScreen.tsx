import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'StartService'>;

export default function StartServiceScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Servicio</Text>
      <Text style={styles.subtitle}>Escanea el código QR en el lavadero</Text>

      <View style={styles.qrPlaceholder}>
        <Text style={styles.qrIcon}>📷</Text>
        <Text style={styles.qrText}>Cámara QR aquí</Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Tu código de reserva</Text>
        <Text style={styles.codeText}>#LAV-001234</Text>
        <Text style={styles.infoSubtitle}>
          Muestra este código al personal si tienes problemas
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Success')}
        >
          <Text style={styles.buttonText}>Simular Escaneo Exitoso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Volver
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
    alignItems: 'center',
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
  qrPlaceholder: {
    width: 250,
    height: 250,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 3,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  qrIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  qrText: {
    fontSize: 16,
    color: '#999',
  },
  infoCard: {
    width: '100%',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 8,
  },
  codeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoSubtitle: {
    fontSize: 14,
    color: '#1976D2',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
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

