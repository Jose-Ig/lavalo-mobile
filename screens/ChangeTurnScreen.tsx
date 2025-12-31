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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangeTurn'>;

// Simulación de turnos existentes (en producción vendría del backend)
const MOCK_VALID_TURNS = [
  { patente: 'ABC123', codigo: 'LAV001' },
  { patente: 'XYZ789', codigo: 'LAV002' },
];

export default function ChangeTurnScreen({ navigation }: Props) {
  const [patente, setPatente] = useState('');
  const [codigo, setCodigo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = () => {
    setHasSearched(true);
    setError(null);

    // Verificar turno (simulación - en producción sería una llamada al API)
    const foundTurn = MOCK_VALID_TURNS.find(
      (turn) =>
        turn.patente.toUpperCase() === patente.toUpperCase() &&
        turn.codigo.toUpperCase() === codigo.toUpperCase()
    );

    if (foundTurn) {
      // Turno válido - navegar a selección de fecha
      navigation.navigate('ChooseDate');
    } else {
      setError('No se encontró una reserva con esos datos. Verificá la patente y el código de reserva.');
    }
  };

  const isFormValid = patente.trim().length > 0 && codigo.trim().length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Cambiar reserva</Text>
        <Text style={styles.subtitle}>
          Ingresá la patente y el código de reserva para modificar tu reserva
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
              onChangeText={(text) => {
                setPatente(text.toUpperCase());
                setHasSearched(false);
              }}
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
              onChangeText={(text) => {
                setCodigo(text.toUpperCase());
                setHasSearched(false);
              }}
            />
          </View>

          {/* Mensaje de error */}
          {error && hasSearched && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, !isFormValid && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={!isFormValid}
            >
              <Text style={styles.buttonText}>Verificar y Continuar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                Cancelar
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información de ayuda */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpTitle}>¿Dónde encuentro el código?</Text>
          <Text style={styles.helpText}>
            El código de reserva fue enviado a tu WhatsApp cuando confirmaste la reserva. 
            Tiene el formato LAV seguido de números (ej: LAV001).
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
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
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
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
  buttonContainer: {
    gap: 12,
    marginTop: 12,
  },
  button: {
    backgroundColor: '#178fe5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#178fe5',
  },
  secondaryButtonText: {
    color: '#178fe5',
  },
  helpContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: '#1565C0',
    lineHeight: 20,
  },
});
