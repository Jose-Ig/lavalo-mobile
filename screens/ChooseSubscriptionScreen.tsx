import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { countDayInMonth } from '../App';
import SubscriptionSelector, { SubscriptionSelection } from '../src/components/SubscriptionSelector';

type Props = NativeStackScreenProps<RootStackParamList, 'ChooseSubscription'>;

const PRICE_MAP: Record<number, string> = {
  15: '$8.000',
  30: '$14.000',
  60: '$25.000',
};

export default function ChooseSubscriptionScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const [selection, setSelection] = useState<SubscriptionSelection>({
    dayOfWeek: 'Lunes',
    time: '09:00',
    duration: 30,
  });

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suscripción mensual</Text>
      </View>

      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <SubscriptionSelector onChange={(s) => setSelection(s)} />

          <View style={styles.priceCard}>
            <Text style={styles.priceLabel}>Precio mensual</Text>
            <Text style={styles.priceValue}>{PRICE_MAP[selection.duration] ?? '-'}</Text>
            <Text style={styles.priceNote}>
              {countDayInMonth(selection.dayOfWeek)} turnos · {selection.dayOfWeek} · {selection.time} hs · {selection.duration} min
            </Text>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={() =>
              navigation.navigate('ReservationForm', {
                flowType: 'subscription',
                subscriptionBooking: {
                  dayOfWeek: selection.dayOfWeek,
                  time: selection.time,
                  duration: selection.duration,
                },
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continuar</Text>
          </TouchableOpacity>
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
    flexGrow: 1,
    padding: 24,
    paddingBottom: 48,
    justifyContent: 'center',
  },
  priceCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 28,
  },
  priceLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 4,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  priceValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 14,
    color: '#666',
  },
  continueButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
