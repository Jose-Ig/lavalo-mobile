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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'StartService'>;

export default function StartServiceScreen({ navigation }: Props) {
  const [patente, setPatente] = useState('');
  const [qrScanned, setQrScanned] = useState(false);
  const [estacion, setEstacion] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const handleScanQR = () => {
    Alert.alert(
      'Escanear QR',
      'Se abrirá la cámara para escanear el código QR del lavadero.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Simular escaneo',
          onPress: () => {
            const estaciones = ['Estación 1', 'Estación 2', 'Estación 3', 'Estación 4'];
            const estacionAleatoria = estaciones[Math.floor(Math.random() * estaciones.length)];
            setQrScanned(true);
            setEstacion(estacionAleatoria);
            Alert.alert('QR Escaneado', `${estacionAleatoria} escaneada correctamente.`);
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
    navigation.navigate('ActiveService');
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Iniciar Servicio</Text>
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
          <Text style={styles.subtitle}>Escanea el código QR en el espacio reservado</Text>

          <TouchableOpacity
            style={[styles.qrButton, qrScanned && styles.qrButtonScanned]}
            onPress={handleScanQR}
            activeOpacity={0.8}
          >
            <Image
              source={require('../assets/qr_scan_icon.png')}
              style={styles.qrIcon}
              resizeMode="contain"
              tintColor="#000"
            />
            <Text style={[styles.qrText, qrScanned && styles.qrTextScanned]}>
              {qrScanned ? 'QR Escaneado ✓' : 'Toca para escanear'}
            </Text>
          </TouchableOpacity>

          {qrScanned && estacion && (
            <View style={styles.estacionContainer}>
              <Text style={styles.estacionLabel}>Espacio asignado</Text>
              <Text style={styles.estacionText}>{estacion}</Text>
            </View>
          )}

          <View style={styles.fieldContainer}>
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

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={handleStartService}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Iniciar</Text>
            </TouchableOpacity>
            <Text style={styles.warningText}>
              Una vez iniciado el servicio, no podrá pausarse ni cancelarse.
            </Text>
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
    alignItems: 'center',
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
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 3,
    borderColor: '#000',
  },
  qrButtonScanned: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  qrIcon: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  qrText: {
    fontSize: 16,
    color: '#333',
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
    width: '100%',
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
  fieldContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 24,
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
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  button: {
    width: '100%',
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
  warningText: {
    marginTop: 16,
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
  },
});
