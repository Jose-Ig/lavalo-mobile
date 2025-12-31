import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

// Función para formatear la fecha
const formatDate = (dateString: string): string => {
  // Parsear la fecha como local (no UTC) agregando la hora T12:00:00
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month es 0-indexed
  
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  
  const dayName = dayNames[date.getDay()];
  const dayNum = date.getDate();
  const monthName = monthNames[date.getMonth()];
  
  return `${dayName} ${dayNum} de ${monthName}`;
};

// Calcular precio basado en duración
const calculatePrice = (duration: number): number => {
  const pricePerHour = 5000; // $5000 por hora
  return (duration / 60) * pricePerHour;
};

export default function PaymentScreen({ navigation, route }: Props) {
  const { reservation } = route.params;
  const total = calculatePrice(reservation.duration);

  const handlePaymentSuccess = () => {
    navigation.navigate('Success');
  };

  const handlePaymentError = () => {
    navigation.navigate('Error');
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pago</Text>
      <Text style={styles.subtitle}>Confirmá los datos y completá el pago</Text>

      {/* Resumen de la reserva */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de tu reserva</Text>
        
        {/* Datos del turno */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Turno</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Día</Text>
            <Text style={styles.summaryValue}>{formatDate(reservation.date)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Hora de inicio</Text>
            <Text style={styles.summaryValue}>{reservation.time} hs</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Duración</Text>
            <Text style={styles.summaryValue}>{reservation.duration} minutos</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Espacio de lavado</Text>
            <Text style={styles.summaryValue}>Espacio {reservation.espacio}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Datos personales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos de contacto</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Nombre</Text>
            <Text style={styles.summaryValue}>{reservation.nombre}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Teléfono</Text>
            <Text style={styles.summaryValue}>{reservation.telefono}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Datos del vehículo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehículo</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Modelo</Text>
            <Text style={styles.summaryValue}>{reservation.modelo}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Patente</Text>
            <Text style={styles.summaryValue}>{reservation.patente}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Total */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total a pagar</Text>
          <Text style={styles.totalValue}>${total.toLocaleString('es-AR')}</Text>
        </View>
      </View>

      {/* Placeholder de integración de pago */}
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>💳 Integración de pago aquí</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePaymentSuccess}
        >
          <Text style={styles.buttonText}>Confirmar y Pagar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.errorButton]}
          onPress={handlePaymentError}
        >
          <Text style={styles.buttonText}>Simular Error</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#fbfaf9',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
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
    marginBottom: 24,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#178fe5',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#178fe5',
  },
  placeholder: {
    width: '100%',
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    fontSize: 18,
    color: '#999',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    backgroundColor: '#178fe5',
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
