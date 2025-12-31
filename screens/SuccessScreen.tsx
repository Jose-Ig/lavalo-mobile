import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Success'>;

export default function SuccessScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require('../assets/success_icon.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.title}>¡Reserva Confirmada!</Text>
      <Text style={styles.subtitle}>
        Tu reserva ha sido exitosa. Te enviamos los detalles por whatsapp.
      </Text>

      <View style={styles.detailsCard}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Fecha</Text>
          <Text style={styles.detailValue}>15 de Enero, 2025</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hora</Text>
          <Text style={styles.detailValue}>10:00 AM</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Código</Text>
          <Text style={styles.detailValue}>#LAV-001234</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.buttonText}>Volver al Inicio</Text>
      </TouchableOpacity>
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
    backgroundColor: '#E8F5E9',
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
    marginBottom: 32,
    lineHeight: 24,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  button: {
    backgroundColor: '#178fe5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

