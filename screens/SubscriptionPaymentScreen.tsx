import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, SubscriptionBooking, SubscriptionReservationData } from '../App';
import { countDayInMonth } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionPayment'>;

const PRICE_MAP: Record<number, string> = {
  15: '$8.000',
  30: '$14.000',
  60: '$25.000',
};

const RENEWAL_DAY_LABEL = (): string => {
  const today = new Date();
  return String(today.getDate());
};

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export default function SubscriptionPaymentScreen({ navigation, route }: Props) {
  const { subscriptionBooking, reservation } = route.params;
  const insets = useSafeAreaInsets();

  const today = new Date();
  const renewalDay = today.getDate();
  const price = PRICE_MAP[subscriptionBooking.duration] ?? '-';
  const turnosEnMes = countDayInMonth(subscriptionBooking.dayOfWeek);

  const handleSuccess = () => {
    navigation.navigate('SubscriptionSuccess', {
      subscriptionBooking,
      renewalDay,
    });
  };

  const handleError = () => {
    navigation.navigate('Error');
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pago de suscripción</Text>
      </View>

      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Subscription summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Detalle de la suscripción</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Día semanal</Text>
              <Text style={styles.detailValue}>{subscriptionBooking.dayOfWeek}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Horario</Text>
              <Text style={styles.detailValue}>{subscriptionBooking.time} hs</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duración</Text>
              <Text style={styles.detailValue}>{subscriptionBooking.duration} min</Text>
            </View>
            <View style={styles.divider} />
            {reservation.nombre ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>A nombre de</Text>
                  <Text style={styles.detailValue}>{reservation.nombre}</Text>
                </View>
                <View style={styles.divider} />
              </>
            ) : null}
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Total mensual</Text>
              <Text style={styles.totalValue}>{price}</Text>
            </View>
          </View>

          {/* Hardcoded card */}
          <View style={styles.card}>
            <Text style={styles.cardBankName}>BANCO UASH</Text>
            <Text style={styles.cardNumber}>•••• •••• •••• 4242</Text>
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardFieldLabel}>TITULAR</Text>
                <Text style={styles.cardFieldValue}>JUAN PÉREZ</Text>
              </View>
              <View>
                <Text style={styles.cardFieldLabel}>VENCE</Text>
                <Text style={styles.cardFieldValue}>12/27</Text>
              </View>
            </View>
          </View>

          <Text style={styles.testNote}>
            Entorno de prueba — elegí el resultado del pago:
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleSuccess}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Simular pago exitoso</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.errorButton}
              onPress={handleError}
              activeOpacity={0.8}
            >
              <Text style={styles.errorButtonText}>Simular error en el pago</Text>
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
  backButton: { padding: 4 },
  backArrow: {
    fontSize: 40,
    color: '#fff',
    lineHeight: 40,
    marginTop: -4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    flexShrink: 1,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  summaryCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 15,
    color: '#666',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  divider: {
    height: 1,
    backgroundColor: '#e8e8e8',
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    height: 180,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  cardBankName: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cardNumber: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: 4,
    textAlign: 'center',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardFieldLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    letterSpacing: 1,
    marginBottom: 2,
  },
  cardFieldValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
  },
  testNote: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  successButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  errorButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c0392b',
  },
  errorButtonText: {
    color: '#c0392b',
    fontSize: 17,
    fontWeight: '600',
  },
});
