import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import {
  VEHICLE_MODELS_WITH_OTHER,
  COUNTRY_CODES,
  VehicleModel,
  CountryCode,
} from '../src/data/vehicleModels';

type Props = NativeStackScreenProps<RootStackParamList, 'ReservationForm'>;

export default function ReservationFormScreen({ navigation, route }: Props) {
  const { booking } = route.params;
  // Estado del formulario
  const [nombre, setNombre] = useState('');
  const [countryCode, setCountryCode] = useState<CountryCode>(COUNTRY_CODES[0]); // Argentina por defecto
  const [codigoArea, setCodigoArea] = useState('');
  const [telefono, setTelefono] = useState('');
  const [patente, setPatente] = useState('');
  
  // Estado para modelo de vehículo
  const [modeloSearch, setModeloSearch] = useState('');
  const [selectedModelo, setSelectedModelo] = useState<VehicleModel | null>(null);
  const [showModeloDropdown, setShowModeloDropdown] = useState(false);
  const [dimensionesCustom, setDimensionesCustom] = useState('');
  
  // Estado para selector de país
  const [showCountryModal, setShowCountryModal] = useState(false);
  
  const modeloInputRef = useRef<TextInput>(null);

  // Filtrar modelos basado en búsqueda
  const filteredModelos = useMemo(() => {
    if (!modeloSearch.trim()) {
      return VEHICLE_MODELS_WITH_OTHER;
    }
    const searchLower = modeloSearch.toLowerCase();
    return VEHICLE_MODELS_WITH_OTHER.filter(
      (v) => v.modelo.toLowerCase().includes(searchLower)
    );
  }, [modeloSearch]);

  // Validar formato de dimensiones: NNN x NNN x NNN
  const validateDimensionesFormat = (value: string): boolean => {
    if (!value.trim()) return false;
    // Regex para formato: número x número x número (con espacios opcionales)
    const regex = /^\d+\s*x\s*\d+\s*x\s*\d+$/i;
    return regex.test(value.trim());
  };

  // Verificar si las dimensiones tienen error (solo si hay texto y el formato es incorrecto)
  const dimensionesHasError = dimensionesCustom.trim().length > 0 && !validateDimensionesFormat(dimensionesCustom);

  // Manejar selección de modelo
  const handleSelectModelo = (modelo: VehicleModel) => {
    setSelectedModelo(modelo);
    setModeloSearch(modelo.modelo);
    setShowModeloDropdown(false);
    if (modelo.modelo !== 'Otro') {
      setDimensionesCustom('');
    }
  };

  // Manejar selección de país
  const handleSelectCountry = (country: CountryCode) => {
    setCountryCode(country);
    setShowCountryModal(false);
  };

  // Validar formulario
  const isFormValid = () => {
    const hasNombre = nombre.trim().length > 0;
    const hasTelefono = codigoArea.trim().length > 0 && telefono.trim().length > 0;
    const hasPatente = patente.trim().length > 0;
    const hasModelo = selectedModelo !== null;
    const hasDimensiones = selectedModelo?.modelo === 'Otro' 
      ? validateDimensionesFormat(dimensionesCustom)
      : true;
    
    return hasNombre && hasTelefono && hasPatente && hasModelo && hasDimensiones;
  };

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
        <Text style={styles.title}>Datos de Reserva</Text>
        <Text style={styles.subtitle}>Completa tus datos para continuar</Text>

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
            <Text style={styles.label}>¿A que número de whatsapp enviamos los datos del turno?</Text>
            <View style={styles.phoneContainer}>
              {/* Selector de código de país */}
              <TouchableOpacity
                style={styles.countrySelector}
                onPress={() => setShowCountryModal(true)}
              >
                <Text style={styles.countryFlag}>{countryCode.flag}</Text>
                <Text style={styles.countryCode}>{countryCode.code}</Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>

              {/* Código de área */}
              <TextInput
                style={styles.areaCodeInput}
                placeholder="Área"
                placeholderTextColor="#999"
                keyboardType="number-pad"
                value={codigoArea}
                onChangeText={(text) => setCodigoArea(text.replace(/[^0-9]/g, ''))}
                maxLength={4}
              />

              {/* Número de teléfono */}
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
            <Text style={styles.phoneHint}>
              Sin 0 en área, sin 15 en número
            </Text>
          </View>

          {/* Modelo de vehículo - Autocomplete */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>¿Cuál es el modelo del vehículo? Para corroborar si es apto para el servicio</Text>
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
                  if (selectedModelo && text !== selectedModelo.modelo) {
                    setSelectedModelo(null);
                  }
                }}
                onFocus={() => setShowModeloDropdown(true)}
              />
              
              {showModeloDropdown && filteredModelos.length > 0 && (
                <View style={styles.dropdown}>
                  <ScrollView 
                    style={styles.dropdownScroll}
                    nestedScrollEnabled={true}
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
              <Text style={styles.phoneHint}>
                En caso de no encontrarse el modelo, seleccioná "Otro" y completá las dimensiones aproximadas
              </Text>
            )}
            
            {selectedModelo && selectedModelo.modelo !== 'Otro' && (
              <Text style={styles.dimensionesInfo}>
                Dimensiones aproximadas: {selectedModelo.dimensiones}
              </Text>
            )}
          </View>

          {/* Dimensiones custom si selecciona "Otro" */}
          {selectedModelo?.modelo === 'Otro' && (
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Dimensiones aproximadas</Text>
              <TextInput
                style={[styles.input, dimensionesHasError && styles.inputError]}
                placeholder="Ej: 420 x 175 x 150"
                placeholderTextColor="#999"
                value={dimensionesCustom}
                onChangeText={setDimensionesCustom}
              />
              <Text style={[styles.phoneHint, dimensionesHasError && styles.errorText]}>
                Formato: largo x ancho x alto en centímetros
              </Text>
            </View>
          )}

          {/* Patente */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>¿Cuál es la patente del vehículo? Necesaria para habilitar el servicio</Text>
            <TextInput
              style={styles.input}
              placeholder="Patente o patente provisoria"
              placeholderTextColor="#999"
              autoCapitalize="characters"
              value={patente}
              onChangeText={(text) => setPatente(text.toUpperCase())}
              maxLength={7}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, !isFormValid() && styles.buttonDisabled]}
          onPress={() => {
            const telefonoCompleto = `${countryCode.code} ${codigoArea} ${telefono}`;
            const dimensiones = selectedModelo?.modelo === 'Otro' 
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
          disabled={!isFormValid()}
        >
          <Text style={styles.buttonText}>Ir a Pagar</Text>
        </TouchableOpacity>

        {/* Modal de selección de país */}
        <Modal
          visible={showCountryModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowCountryModal(false)}
        >
          <Pressable 
            style={styles.modalOverlay}
            onPress={() => setShowCountryModal(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Seleccionar país</Text>
              <FlatList
                data={COUNTRY_CODES}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.countryItem,
                      item.code === countryCode.code && styles.countryItemSelected,
                    ]}
                    onPress={() => handleSelectCountry(item)}
                  >
                    <Text style={styles.countryItemFlag}>{item.flag}</Text>
                    <Text style={styles.countryItemName}>{item.country}</Text>
                    <Text style={styles.countryItemCode}>{item.code}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>
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
  },
  form: {
    gap: 20,
    marginBottom: 40,
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
  
  // Teléfono
  phoneContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 4,
  },
  countryFlag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
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
  phoneHint: {
    fontSize: 12,
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
  
  // Autocomplete
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
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  dimensionesInfo: {
    fontSize: 13,
    color: '#178fe5',
    marginTop: 4,
    fontWeight: '500',
  },
  
  // Botón
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
  
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '85%',
    maxHeight: '70%',
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  countryItemSelected: {
    backgroundColor: 'rgba(23, 143, 229, 0.1)',
  },
  countryItemFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryItemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  countryItemCode: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});
