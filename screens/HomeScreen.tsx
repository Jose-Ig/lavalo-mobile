import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const WHATSAPP_NUMBER = '543425145633';

export default function HomeScreen({ navigation }: Props) {
  const handleWhatsAppPress = () => {
    const message = 'Hola, tengo un problema y necesito ayuda';
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      // Si no tiene WhatsApp instalado, abrir en web
      Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
    });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/lavalo_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.subtitle}>
        Si querés a tu auto, lavalo vos
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('ChooseDate')}
        >
          <Text style={styles.buttonText}>Quiero una reserva</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('HaveTurn')}
        >
          <Text style={styles.buttonText}>Tengo una reserva</Text>
        </TouchableOpacity>
      </View>

      {/* Botón WhatsApp flotante */}
      <TouchableOpacity
        style={styles.whatsappButton}
        onPress={handleWhatsAppPress}
        activeOpacity={0.8}
      >
        <Image
          source={require('../assets/whatsapp_icon.png')}
          style={styles.whatsappIcon}
          resizeMode="contain"
        />
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
  logo: {
    width: '100%',
    height: 311,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    backgroundColor: '#178fe5',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  whatsappButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#29a71a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  whatsappIcon: {
    width: 35,
    height: 35,
  },
});
