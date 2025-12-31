import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'HaveTurn'>;

export default function HaveTurnScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mi Reserva</Text>
      <Text style={styles.subtitle}>
        ¿Qué querés hacer con tu reserva?
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('StartService')}
        >
          <Text style={styles.buttonText}>Iniciar Servicio</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonWhite]}
          onPress={() => navigation.navigate('VerifyTurn')}
        >
          <Text style={[styles.buttonText, styles.buttonTextBlue]}>Ver datos de mi reserva</Text>
        </TouchableOpacity>
      </View>

      {/* Texto clickeable para cambiar turno */}
      <TouchableOpacity
        style={styles.changeTurnLink}
        onPress={() => navigation.navigate('ChangeTurn')}
      >
        <Text style={styles.changeTurnText}>Cambiar Reserva</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbfaf9',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    backgroundColor: '#178fe5',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonWhite: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#178fe5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextBlue: {
    color: '#178fe5',
  },
  changeTurnLink: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 12,
  },
  changeTurnText: {
    color: '#178fe5',
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
