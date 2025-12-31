import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'StartService'>;

export default function StartServiceScreen({ navigation }: Props) {
  const [patente, setPatente] = useState('');
  const [qrScanned, setQrScanned] = useState(false);
  const [estacion, setEstacion] = useState<string | null>(null);

  const handleScanQR = () => {
    // TODO: Integrar expo-camera o expo-barcode-scanner para escaneo real
    Alert.alert(
      'Escanear QR',
      'Se abrirá la cámara para escanear el código QR del lavadero.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Simular escaneo',
          onPress: () => {
            // Simular obtener la estación del QR escaneado
            const estacionesSimuladas = ['Estación 1', 'Estación 2', 'Estación 3', 'Estación 4'];
            const estacionAleatoria = estacionesSimuladas[Math.floor(Math.random() * estacionesSimuladas.length)];
            
            setQrScanned(true);
            setEstacion(estacionAleatoria);
            Alert.alert('✅ QR Escaneado', `Código QR de ${estacionAleatoria} escaneado correctamente.`);
          },
        },
      ]
    );
  };

  const handleStartService = () => {
    if (!patente.trim()) {
      Alert.alert('Error', 'Por favor ingresá la patente del vehículo.');
      return;
    }
    
    // TODO: Validar con backend y iniciar servicio
    navigation.navigate('Success');
  };

  const isFormValid = patente.trim().length > 0;

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
        <Text style={styles.title}>Iniciar Servicio</Text>
        <Text style={styles.subtitle}>Escanea el código QR en el espacio reservado</Text>

        {/* Botón de escaneo QR */}
        <TouchableOpacity
          style={[styles.qrButton, qrScanned && styles.qrButtonScanned]}
          onPress={handleScanQR}
          activeOpacity={0.8}
        >
          {/* Icono bicolor: mitad negro, mitad azul */}
          <View style={styles.qrIconContainer}>
            {/* Mitad izquierda - Negro */}
            <View style={styles.qrIconHalfLeft}>
              <Image
                source={require('../assets/qr_scan_icon.png')}
                style={[styles.qrIcon, { tintColor: '#333' }]}
                resizeMode="contain"
              />
            </View>
            {/* Mitad derecha - Azul */}
            <View style={styles.qrIconHalfRight}>
              <Image
                source={require('../assets/qr_scan_icon.png')}
                style={[styles.qrIcon, { tintColor: '#178fe5' }]}
                resizeMode="contain"
              />
            </View>
          </View>
          <Text style={[styles.qrText, qrScanned && styles.qrTextScanned]}>
            {qrScanned ? 'QR Escaneado ✓' : 'Toca para escanear'}
          </Text>
        </TouchableOpacity>

        {/* Mostrar estación escaneada */}
        {qrScanned && estacion && (
          <View style={styles.estacionContainer}>
            <Text style={styles.estacionLabel}>Espacio asignado:</Text>
            <Text style={styles.estacionText}>{estacion}</Text>
          </View>
        )}

        {/* Input de patente */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Patente del vehículo</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: ABC123"
            placeholderTextColor="#999"
            autoCapitalize="characters"
            value={patente}
            onChangeText={(text) => setPatente(text.toUpperCase())}
            maxLength={7}
          />
        </View>

        {/* Botón Iniciar */}
        <View style={styles.startContainer}>
          <TouchableOpacity
            style={[styles.startButton, !isFormValid && styles.startButtonDisabled]}
            onPress={handleStartService}
            disabled={!isFormValid}
          >
            <Text style={styles.startButtonText}>Iniciar</Text>
          </TouchableOpacity>

          <Text style={styles.warningText}>
            Una vez iniciado el servicio, este durará durante el tiempo reservado y no podrá pausarse ni cancelarse.
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
    alignItems: 'center',
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
    textAlign: 'center',
  },
  qrButton: {
    width: 200,
    height: 200,
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 3,
    borderColor: '#178fe5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  qrButtonScanned: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  qrIconContainer: {
    width: 80,
    height: 80,
    marginBottom: 12,
    position: 'relative',
  },
  qrIconHalfLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 40,
    height: 80,
    overflow: 'hidden',
  },
  qrIconHalfRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 40,
    height: 80,
    overflow: 'hidden',
    alignItems: 'flex-end',
  },
  qrIcon: {
    width: 80,
    height: 80,
  },
  qrText: {
    fontSize: 16,
    color: '#178fe5',
    fontWeight: '500',
  },
  qrTextScanned: {
    color: '#4CAF50',
  },
  estacionContainer: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  estacionLabel: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
  },
  estacionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  startContainer: {
    width: '100%',
    alignItems: 'center',
  },
  startButton: {
    width: '100%',
    backgroundColor: '#178fe5',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonDisabled: {
    backgroundColor: '#ccc',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  warningText: {
    marginTop: 16,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
