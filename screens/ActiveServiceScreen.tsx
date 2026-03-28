import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveService'>;

const INITIAL_MINUTES = 30;
const TIME_OPTIONS = [15, 30, 60];
const PRICE_PER_OPTION: Record<number, string> = { 15: '$500', 30: '$900', 60: '$1.600' };

const formatTime = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const showToast = (
  message: string,
  opacityAnim: Animated.Value,
  translateAnim: Animated.Value
) => {
  opacityAnim.setValue(0);
  translateAnim.setValue(20);
  Animated.parallel([
    Animated.timing(opacityAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
    Animated.timing(translateAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
  ]).start(() => {
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
        Animated.timing(translateAnim, { toValue: 20, duration: 380, useNativeDriver: true }),
      ]).start();
    }, 2500);
  });
};

export default function ActiveServiceScreen({ navigation }: Props) {
  const [timeLeft, setTimeLeft] = useState(INITIAL_MINUTES * 60);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingMinutes, setPendingMinutes] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const insets = useSafeAreaInsets();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslate = useRef(new Animated.Value(20)).current;

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    startPulse();
  }, [startPulse]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timeLeft > 0 ? 1 : 0]);

  const handleSelectTime = (minutes: number) => {
    setShowTimePicker(false);
    setPendingMinutes(minutes);
    setShowPayment(true);
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setTimeLeft((prev) => prev + (pendingMinutes ?? 0) * 60);
    setPendingMinutes(null);
    setToastMessage('El cobro se realizó correctamente');
    showToast('El cobro se realizó correctamente', toastOpacity, toastTranslate);
  };

  const handlePaymentError = () => {
    setShowPayment(false);
    setPendingMinutes(null);
    setToastMessage('El pago no pudo realizarse');
    showToast('El pago no pudo realizarse', toastOpacity, toastTranslate);
  };

  const handleFinish = () => {
    Alert.alert(
      'Terminar servicio',
      '¿Estás seguro de que deseás terminar el servicio en curso? Esta acción no puede revertirse.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            navigation.navigate('Home', { toast: 'Servicio finalizado' });
          },
        },
      ]
    );
  };

  const isFinished = timeLeft === 0;
  const isLow = timeLeft > 0 && timeLeft <= 5 * 60;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Servicio en curso</Text>
      </View>

      <View style={styles.sheet}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.timerCircle,
              isLow && styles.timerCircleLow,
              isFinished && styles.timerCircleFinished,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.timerLabel}>
              {isFinished ? 'Tiempo\nagotado' : 'Tiempo\nrestante'}
            </Text>
            <Text style={[styles.timerText, isFinished && styles.timerTextFinished]}>
              {formatTime(timeLeft)}
            </Text>
          </Animated.View>

          <Text style={styles.statusText}>
            {isFinished ? 'Tu tiempo de servicio ha finalizado.' : 'Tu servicio está en progreso.'}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.addTimeButton, isFinished && styles.addTimeButtonDisabled]}
              onPress={() => setShowTimePicker(true)}
              disabled={isFinished}
              activeOpacity={0.8}
            >
              <Text style={[styles.addTimeButtonText, isFinished && styles.addTimeButtonTextDisabled]}>
                Necesito más tiempo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinish}
              activeOpacity={0.8}
            >
              <Text style={styles.finishButtonText}>Terminar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Toast */}
        <Animated.View
          style={[
            styles.toast,
            { bottom: insets.bottom + 88, opacity: toastOpacity, transform: [{ translateY: toastTranslate }] },
          ]}
          pointerEvents="none"
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      </View>

      {/* Time picker modal */}
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowTimePicker(false)}
        >
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>¿Cuánto tiempo más?</Text>
            <View style={styles.modalOptions}>
              {TIME_OPTIONS.map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={styles.modalOption}
                  onPress={() => handleSelectTime(mins)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalOptionMinutes}>{mins}</Text>
                  <Text style={styles.modalOptionLabel}>min</Text>
                  <Text style={styles.modalOptionPrice}>{PRICE_PER_OPTION[mins]}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowTimePicker(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Payment modal */}
      <Modal
        visible={showPayment}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPayment(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, styles.paymentSheet]}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Pasarela de pago</Text>

            <ScrollView style={styles.paymentScroll} showsVerticalScrollIndicator={false}>
              {/* Hardcoded payment summary */}
              <View style={styles.paymentSummaryCard}>
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Tiempo adicional</Text>
                  <Text style={styles.paymentValue}>{pendingMinutes} min</Text>
                </View>
                <View style={styles.paymentDivider} />
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Total a cobrar</Text>
                  <Text style={styles.paymentTotal}>
                    {pendingMinutes ? PRICE_PER_OPTION[pendingMinutes] : ''}
                  </Text>
                </View>
              </View>

              {/* Hardcoded card info */}
              <View style={styles.cardContainer}>
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
              </View>

              <Text style={styles.paymentNote}>
                Este es un entorno de prueba. Elegí el resultado del pago:
              </Text>
            </ScrollView>

            <View style={styles.paymentButtons}>
              <TouchableOpacity
                style={styles.paySuccessButton}
                onPress={handlePaymentSuccess}
                activeOpacity={0.8}
              >
                <Text style={styles.paySuccessText}>Simular pago exitoso</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.payErrorButton}
                onPress={handlePaymentError}
                activeOpacity={0.8}
              >
                <Text style={styles.payErrorText}>Simular error en el pago</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  timerCircleLow: {
    backgroundColor: '#c0392b',
  },
  timerCircleFinished: {
    backgroundColor: '#888',
  },
  timerLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  timerText: {
    fontSize: 52,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 2,
  },
  timerTextFinished: {
    fontSize: 40,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 48,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  addTimeButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  addTimeButtonDisabled: {
    backgroundColor: '#ccc',
  },
  addTimeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  addTimeButtonTextDisabled: {
    color: '#fff',
  },
  finishButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#000',
  },
  finishButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  // ── Shared modal ──────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 28,
  },
  // ── Time picker ───────────────────────────────
  modalOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  modalOption: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 2,
  },
  modalOptionMinutes: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
  },
  modalOptionLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  modalOptionPrice: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  modalCancelButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  modalCancelText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '600',
  },
  // ── Payment modal ─────────────────────────────
  paymentSheet: {
    paddingBottom: 32,
    alignItems: 'stretch',
  },
  paymentScroll: {
    width: '100%',
  },
  paymentSummaryCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  paymentLabel: {
    fontSize: 15,
    color: '#666',
  },
  paymentValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  paymentDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 10,
  },
  paymentTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  cardContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    height: 180,
    justifyContent: 'space-between',
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
  paymentNote: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  paymentButtons: {
    gap: 12,
    marginTop: 4,
  },
  paySuccessButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  paySuccessText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  payErrorButton: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#c0392b',
  },
  payErrorText: {
    color: '#c0392b',
    fontSize: 17,
    fontWeight: '600',
  },
});
