import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Error'>;

export default function ErrorScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require('../assets/warning_icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>Error en el pago</Text>
      <Text style={styles.subtitle}>
        No pudimos procesar tu pago. Por favor, intenta nuevamente.
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Volver al Inicio
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaf9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  icon: {
    width: 60,
    height: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: '#178fe5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#178fe5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#178fe5',
  },
});

