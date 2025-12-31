import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

export default function PaymentScreen({ navigation }: Props) {
  const handlePaymentSuccess = () => {
    navigation.navigate('Success');
  };

  const handlePaymentError = () => {
    navigation.navigate('Error');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pago</Text>
      <Text style={styles.subtitle}>Completa el pago para confirmar tu turno</Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Lavado completo</Text>
          <Text style={styles.summaryValue}>$5.000</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>$5.000</Text>
        </View>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>💳 Integración de pago aquí</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePaymentSuccess}
        >
          <Text style={styles.buttonText}>Simular Pago Exitoso</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={handlePaymentError}
        >
          <Text style={styles.buttonText}>Simular Error</Text>
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
  summaryCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  placeholder: {
    width: '100%',
    height: 120,
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
  errorButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

