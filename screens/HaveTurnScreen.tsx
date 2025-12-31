import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'HaveTurn'>;

export default function HaveTurnScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Turno</Text>
      <Text style={styles.subtitle}>Detalles de tu reserva actual</Text>

      <View style={styles.turnCard}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Confirmado</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha</Text>
          <Text style={styles.detailValue}>15 de Enero, 2025</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hora</Text>
          <Text style={styles.detailValue}>10:00 AM</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Servicio</Text>
          <Text style={styles.detailValue}>Lavado Completo</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Código</Text>
          <Text style={styles.detailValue}>#LAV-001234</Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('StartService')}
        >
          <Text style={styles.buttonText}>Iniciar Servicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('ChangeTurn')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Cambiar Turno
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.dangerButton]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Cancelar Turno</Text>
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
  turnCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    gap: 16,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  dangerButton: {
    backgroundColor: '#FF3B30',
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

