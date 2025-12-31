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

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyTurn'>;

// Datos de turno simulados (en producción vendría del backend)
interface TurnData {
  patente: string;
  codigo: string;
  fecha: string;
  hora: string;
  duracion: string;
  nombre: string;
  modelo: string;
  estado: string;
}

// Simulación de turnos existentes
const MOCK_TURNS: TurnData[] = [
  {
    patente: 'ABC123',
    codigo: 'LAV001',
    fecha: '15 de Enero, 2025',
    hora: '10:00',
    duracion: '60 min',
    nombre: 'Juan Pérez',
    modelo: 'Toyota Corolla',
    estado: 'Confirmado',
  },
  {
    patente: 'XYZ789',
    codigo: 'LAV002',
    fecha: '16 de Enero, 2025',
    hora: '14:30',
    duracion: '90 min',
    nombre: 'María García',
    modelo: 'Ford Focus 4P',
    estado: 'Confirmado',
  },
];

export default function VerifyTurnScreen({ navigation }: Props) {
  const [patente, setPatente] = useState('');
  const [codigo, setCodigo] = useState('');
  const [turnData, setTurnData] = useState<TurnData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleVerify = () => {
    setHasSearched(true);
    setError(null);
    setTurnData(null);

    // Buscar turno (simulación - en producción sería una llamada al API)
    const foundTurn = MOCK_TURNS.find(
      (turn) =>
        turn.patente.toUpperCase() === patente.toUpperCase() &&
        turn.codigo.toUpperCase() === codigo.toUpperCase()
    );

    if (foundTurn) {
      setTurnData(foundTurn);
    } else {
      setError('No se encontró una reserva con esos datos. Verificá la patente y el código de confirmación.');
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
        <Text style={styles.title}>Ver Datos de mi Turno</Text>
        <Text style={styles.subtitle}>
          Ingresá la patente y el código de confirmación que recibiste por WhatsApp
        </Text>

        {/* Formulario de verificación */}
        {!turnData && (
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
              <Text style={styles.label}>Código de confirmación</Text>
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

            <TouchableOpacity
              style={[styles.button, !isFormValid && styles.buttonDisabled]}
              onPress={handleVerify}
              disabled={!isFormValid}
            >
              <Text style={styles.buttonText}>Buscar Turno</Text>
            </TouchableOpacity>

            {/* Información de ayuda */}
            <View style={styles.helpContainer}>
              <Text style={styles.helpTitle}>¿Dónde encuentro el código?</Text>
              <Text style={styles.helpText}>
                El código de confirmación fue enviado a tu WhatsApp cuando confirmaste la reserva. 
                Tiene el formato LAV seguido de números (ej: LAV001).
              </Text>
            </View>
          </View>
        )}

        {/* Datos del turno encontrado */}
        {turnData && (
          <View style={styles.turnCard}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{turnData.estado}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Nombre</Text>
              <Text style={styles.detailValue}>{turnData.nombre}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Fecha</Text>
              <Text style={styles.detailValue}>{turnData.fecha}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hora</Text>
              <Text style={styles.detailValue}>{turnData.hora}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duración</Text>
              <Text style={styles.detailValue}>{turnData.duracion}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Vehículo</Text>
              <Text style={styles.detailValue}>{turnData.modelo}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Patente</Text>
              <Text style={styles.detailValue}>{turnData.patente}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Código</Text>
              <Text style={styles.detailValue}>#{turnData.codigo}</Text>
            </View>

            <View style={styles.buttonContainerCard}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('StartService')}
              >
                <Text style={styles.buttonText}>Iniciar Servicio</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => {
                  setTurnData(null);
                  setPatente('');
                  setCodigo('');
                  setHasSearched(false);
                }}
              >
                <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                  Buscar Otro Turno
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  button: {
    backgroundColor: '#178fe5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
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
    marginTop: 0,
  },
  secondaryButtonText: {
    color: '#178fe5',
  },
  turnCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  buttonContainerCard: {
    gap: 12,
    marginTop: 8,
  },
  helpContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
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

