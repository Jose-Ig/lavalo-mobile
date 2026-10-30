import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { countDayInMonth } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'SubscriptionSuccess'>;

const PRICE_MAP: Record<number, string> = {
  15: '$8.000',
  30: '$14.000',
  60: '$25.000',
};

export default function SubscriptionSuccessScreen({ navigation, route }: Props) {
  const { subscriptionBooking, renewalDay } = route.params;
  const insets = useSafeAreaInsets();
  const scale = useRef(new Animated.Value(0)).current;

  const today = new Date();
  const turnosEnMes = countDayInMonth(subscriptionBooking.dayOfWeek);

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Suscripción activada</Text>
      </View>

      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.iconWrap, { transform: [{ scale }] }]}>
            <Image
              source={require('../assets/success_icon.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </Animated.View>

          <Text style={styles.title}>¡Tu suscripción está activa!</Text>
          <Text style={styles.subtitle}>
            Tu turno quedará reservado todos los {subscriptionBooking.dayOfWeek} del mes en el horario elegido.
          </Text>

          <View style={styles.detailsCard}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Código</Text>
              <Text style={styles.detailValue}>#SUB-001234</Text>
            </View>
            <View style={styles.divider} />
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
              <Text style={styles.detailLabel}>Duración por turno</Text>
              <Text style={styles.detailValue}>{subscriptionBooking.duration} min</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Turnos este mes</Text>
              <Text style={styles.detailValue}>{turnosEnMes} ({subscriptionBooking.dayOfWeek}s)</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Precio mensual</Text>
              <Text style={styles.detailValue}>{PRICE_MAP[subscriptionBooking.duration] ?? '-'}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Home')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Volver al Inicio</Text>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
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
    padding: 24,
    paddingBottom: 48,
    alignItems: 'center',
  },
  iconWrap: {
    marginBottom: 24,
    marginTop: 8,
  },
  icon: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
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
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
