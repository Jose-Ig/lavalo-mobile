import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

import { createReservation, apiErrorMessage, BookingResponse } from '../src/services/api';

import { loadCheckoutSession, saveCheckoutSession } from '../src/services/checkoutSession';

type Props = NativeStackScreenProps<RootStackParamList, 'Payment'>;

const formatDate = (dateString: string): string => {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${dayNames[date.getDay()]} ${date.getDate()} de ${monthNames[date.getMonth()]}`;
};

const calculatePrice = (duration: number): number => {
  const pricePerHour = 5000;
  return (duration / 60) * pricePerHour;
};

export default function PaymentScreen({ navigation, route }: Props) {
  const { reservation } = route.params;
  const [pending, setPending] = useState<BookingResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const reserve = async () => {
    if (savingRef.current) return;
    savingRef.current = true; setSaving(true);
    try {
      const saved = await loadCheckoutSession();
      if (saved) { navigation.navigate('CheckoutStatus'); return; }
      const result = pending || await createReservation(reservation);
      setPending(result);
      // Persist the capability before exposing a payment URL; storage failure blocks checkout.
      await saveCheckoutSession(result);
      navigation.navigate('CheckoutStatus');
    } catch (error) { Alert.alert('No pudimos reservar', apiErrorMessage(error)); }
    finally { savingRef.current = false; setSaving(false); }
  };
  const total = calculatePrice(reservation.duration);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      {/* Header azul */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago</Text>
      </View>

      {/* Sheet blanco */}
      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Resumen de la reserva */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Resumen de tu reserva</Text>

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
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Datos de contacto</Text>
              {reservation.nombre ? (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Nombre</Text>
                  <Text style={styles.summaryValue}>{reservation.nombre}</Text>
                </View>
              ) : null}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Teléfono</Text>
                <Text style={styles.summaryValue}>{reservation.telefono}</Text>
              </View>
            </View>

            <View style={styles.divider} />

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

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total a pagar</Text>
              <Text style={styles.totalValue}>${total.toLocaleString('es-AR')}</Text>
            </View>
          </View>

          {/* Placeholder integración de pago */}
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>El importe se confirma en el servidor. Continuarás al checkout de Mercado Pago para realizar el pago.</Text>
          </View>

          <View style={styles.buttonContainer}>
            {pending && <Text>Reserva #{pending.data.id} pendiente. Vence: {new Date(pending.data.expires_at!).toLocaleTimeString('es-AR')}. El turno se confirma después de verificar el pago.</Text>}
            <TouchableOpacity style={styles.button} disabled={saving} onPress={reserve}>
              <Text style={styles.buttonText}>{saving ? 'Guardando…' : pending ? 'Continuar con mi reserva' : 'Continuar al pago'}</Text>
            </TouchableOpacity>
          </View>
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
    padding: 20,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
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
    color: '#000',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#666',
  },
  summaryValue: {
    fontSize: 15,
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
    color: '#000',
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
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  errorButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
