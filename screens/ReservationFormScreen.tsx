import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import {
  VEHICLE_MODELS_WITH_OTHER,
  VehicleModel,
} from '../src/data/vehicleModels';

type Props = NativeStackScreenProps<RootStackParamList, 'ReservationForm'>;

export default function ReservationFormScreen({ navigation, route }: Props) {
  const { booking } = route.params;
  const insets = useSafeAreaInsets();

  const [nombre, setNombre] = useState('');
  const [codigoArea, setCodigoArea] = useState('');
  const [telefono, setTelefono] = useState('');
  const [patente, setPatente] = useState('');
  const [modeloSearch, setModeloSearch] = useState('');
  const [selectedModelo, setSelectedModelo] = useState<VehicleModel | null>(null);
  const [showModeloDropdown, setShowModeloDropdown] = useState(false);
  const [dimensionesCustom, setDimensionesCustom] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const modeloInputRef = useRef<TextInput>(null);

  const filteredModelos = useMemo(() => {
    if (!modeloSearch.trim()) return VEHICLE_MODELS_WITH_OTHER;
    const searchLower = modeloSearch.toLowerCase();
    return VEHICLE_MODELS_WITH_OTHER.filter(
      (v) => v.modelo.toLowerCase().includes(searchLower)
    );
  }, [modeloSearch]);

  const validateDimensionesFormat = (value: string): boolean => {
    if (!value.trim()) return false;
    const regex = /^\d+\s*x\s*\d+\s*x\s*\d+$/i;
    return regex.test(value.trim());
  };

  const dimensionesHasError =
    dimensionesCustom.trim().length > 0 && !validateDimensionesFormat(dimensionesCustom);

  const handleSelectModelo = (modelo: VehicleModel) => {
    setSelectedModelo(modelo);
    setModeloSearch(modelo.modelo);
    setShowModeloDropdown(false);
    if (modelo.modelo !== 'Otro') setDimensionesCustom('');
  };

  const isFormValid = () => {
    const hasTelefono = codigoArea.trim().length > 0 && telefono.trim().length > 0;
    const hasPatente = patente.trim().length > 0;
    const hasModelo = selectedModelo !== null;
    const hasDimensiones =
      selectedModelo?.modelo === 'Otro' ? validateDimensionesFormat(dimensionesCustom) : true;
    return hasTelefono && hasPatente && hasModelo && hasDimensiones;
  };

  return (
    <View style={styles.root}>
      {/* Header azul */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backArrow}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Datos de reserva</Text>
      </View>

      {/* Sheet blanco */}
      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.form}>
            {/* Nombre */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>¿A nombre de quién es la reserva?</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre completo"
                placeholderTextColor="#999"
                value={nombre}
                onChangeText={setNombre}
              />
            </View>

            {/* Teléfono */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>¿A qué número de WhatsApp enviamos los datos de la reserva?<Text style={styles.required}> *</Text></Text>
              </View>
              <View style={styles.phoneContainer}>
                <View style={styles.countryFixed}>
                  <Text style={styles.countryFixedText}>+54</Text>
                </View>
                <TextInput
                  style={styles.areaCodeInput}
                  placeholder="Área"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={codigoArea}
                  onChangeText={(text) => setCodigoArea(text.replace(/[^0-9]/g, ''))}
                  maxLength={4}
                />
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Número"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  value={telefono}
                  onChangeText={(text) => setTelefono(text.replace(/[^0-9]/g, ''))}
                  maxLength={8}
                />
              </View>
              <Text style={styles.hint}>Sin 0 en área, sin 15 en número</Text>
              {submitted && !(codigoArea.trim().length > 0 && telefono.trim().length > 0) && (
                <Text style={styles.fieldError}>Dato obligatorio</Text>
              )}
            </View>

            {/* Modelo */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>¿Cuál es el modelo del vehículo?</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <View style={styles.autocompleteContainer}>
                <TextInput
                  ref={modeloInputRef}
                  style={styles.input}
                  placeholder="Buscar modelo..."
                  placeholderTextColor="#999"
                  value={modeloSearch}
                  onChangeText={(text) => {
                    setModeloSearch(text);
                    setShowModeloDropdown(true);
                    if (selectedModelo && text !== selectedModelo.modelo) setSelectedModelo(null);
                  }}
                  onFocus={() => setShowModeloDropdown(true)}
                />
                {showModeloDropdown && filteredModelos.length > 0 && (
                  <View style={styles.dropdown}>
                    <ScrollView
                      style={styles.dropdownScroll}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredModelos.slice(0, 10).map((modelo, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.dropdownItem}
                          onPress={() => handleSelectModelo(modelo)}
                        >
                          <Text style={styles.dropdownItemText}>{modelo.modelo}</Text>
                        </TouchableOpacity>
                      ))}
                      {filteredModelos.length > 10 && (
                        <Text style={styles.moreResults}>
                          +{filteredModelos.length - 10} más resultados...
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
              {!selectedModelo && (
                <Text style={styles.hint}>
                  Si no encontrás el modelo, seleccioná "Otro" y completá las dimensiones
                </Text>
              )}
              {submitted && !selectedModelo && (
                <Text style={styles.fieldError}>Dato obligatorio</Text>
              )}
            </View>

            {/* Dimensiones custom */}
            {selectedModelo?.modelo === 'Otro' && (
              <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Dimensiones aproximadas</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={[styles.input, dimensionesHasError && styles.inputError]}
                  placeholder="Ej: 420 x 175 x 150"
                  placeholderTextColor="#999"
                  value={dimensionesCustom}
                  onChangeText={setDimensionesCustom}
                />
                <Text style={[styles.hint, dimensionesHasError && styles.errorText]}>
                  Formato: largo x ancho x alto en centímetros
                </Text>
                {submitted && !validateDimensionesFormat(dimensionesCustom) && (
                  <Text style={styles.fieldError}>Dato obligatorio</Text>
                )}
              </View>
            )}

            {/* Patente */}
            <View style={styles.fieldContainer}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>¿Cuál es la patente del vehículo?</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Patente o patente provisoria"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                value={patente}
                onChangeText={(text) => setPatente(text.toUpperCase())}
                maxLength={7}
              />
              {submitted && !patente.trim() && (
                <Text style={styles.fieldError}>Dato obligatorio</Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              setSubmitted(true);
              if (!isFormValid()) return;
              const telefonoCompleto = `+54 ${codigoArea} ${telefono}`;
              const dimensiones =
                selectedModelo?.modelo === 'Otro'
                  ? dimensionesCustom
                  : selectedModelo?.dimensiones || '';
              navigation.navigate('Payment', {
                reservation: {
                  ...booking,
                  nombre,
                  telefono: telefonoCompleto,
                  patente,
                  modelo: selectedModelo?.modelo || '',
                  dimensiones,
                },
              });
            }}
          >
            <Text style={styles.buttonText}>Ir a Pagar</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal de selección de país eliminado — código fijo +54 */}
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
  },
  required: {
    fontSize: 16,
    color: '#ef5350',
    fontWeight: '700',
    lineHeight: 22,
  },
  countryFixed: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  countryFixedText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  areaCodeInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  phoneInput: {
    flex: 2,
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 16,
    color: '#333',
  },
  hint: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  errorText: {
    color: '#ef5350',
    fontWeight: '500',
  },
  fieldError: {
    fontSize: 13,
    color: '#ef5350',
    fontWeight: '600',
    marginTop: 2,
  },
  autocompleteContainer: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
    maxHeight: 250,
    zIndex: 1001,
  },
  dropdownScroll: {
    maxHeight: 250,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  moreResults: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#999',
    fontStyle: 'italic',
  },
  dimensionesInfo: {
    fontSize: 15,
    color: '#555',
    marginTop: 4,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
