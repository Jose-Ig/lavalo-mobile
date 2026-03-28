import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangeTurn'>;

const MOCK_VALID_TURNS = [
  { patente: 'ABC123', codigo: 'LAV001' },
  { patente: 'XYZ789', codigo: 'LAV002' },
];

export default function ChangeTurnScreen({ navigation }: Props) {
  const [patente, setPatente] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const insets = useSafeAreaInsets();

  const handleVerify = () => {
    setHasSearched(true);
    setError(null);
    const foundTurn = MOCK_VALID_TURNS.find(
      (turn) =>
        turn.patente.toUpperCase() === patente.toUpperCase() &&
        turn.codigo.toUpperCase() === codigo.toUpperCase()
    );
    if (foundTurn) {
      navigation.navigate('ChooseDate');
    } else {
      setError('No se encontró una reserva con esos datos. Verificá la patente y el código de reserva.');
    }
  };

  const isFormValid = patente.trim().length > 0 && codigo.trim().length > 0;

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cambiar reserva</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Ingresá la patente y el código de reserva para modificarla
          </Text>

          <View style={styles.form}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Patente del vehículo</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: ABC123"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                value={patente}
                onChangeText={(text) => { setPatente(text.toUpperCase()); setHasSearched(false); }}
                maxLength={7}
              />
            </View>

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Código de reserva</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: LAV001"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                value={codigo}
                onChangeText={(text) => { setCodigo(text.toUpperCase()); setHasSearched(false); }}
              />
            </View>

            {error && hasSearched && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>¿Dónde encuentro el código?</Text>
              <Text style={styles.helpText}>
                El código fue enviado a tu WhatsApp al confirmar la reserva. Formato: LAV seguido de números (ej: LAV001).
              </Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleVerify}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Verificar y Continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
    padding: 24,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef5350',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    lineHeight: 20,
  },
  helpContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
});
