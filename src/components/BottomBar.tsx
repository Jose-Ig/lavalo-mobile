import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

const WHATSAPP_NUMBER = '543425145633';
const MAPS_URL = 'https://www.google.com/maps?q=-31.641812,-60.685722';
const INSTAGRAM_URL = 'https://www.instagram.com/jose.ig.prieto';

export default function BottomBar() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();

  const handleWhatsAppPress = () => {
    const message = 'Hola, tengo un problema y necesito ayuda';
    const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`);
    });
  };

  const handleMapsPress = () => {
    Linking.openURL(`comgooglemaps://?q=-31.641812,-60.685722`).catch(() => {
      Linking.openURL(MAPS_URL);
    });
  };

  const handleInstagramPress = () => {
    Linking.openURL(INSTAGRAM_URL);
  };

  return (
    <View style={[styles.bottomBar, { paddingBottom: insets.bottom }]}>
      <TouchableOpacity
        style={styles.barItem}
        onPress={() => navigation.navigate('Home')}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../assets/home_icon.png')}
          style={styles.barIcon}
          resizeMode="contain"
        />
        <Text style={styles.barLabel}>Inicio</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.barItem}
        onPress={handleMapsPress}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../assets/location_icon.png')}
          style={styles.barIcon}
          resizeMode="contain"
        />
        <Text style={styles.barLabel}>Donde estamos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.barItem}
        onPress={handleWhatsAppPress}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../assets/whatsapp_icon.png')}
          style={styles.barIcon}
          resizeMode="contain"
        />
        <Text style={styles.barLabel}>Dudas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.barItem}
        onPress={handleInstagramPress}
        activeOpacity={0.7}
      >
        <Image
          source={require('../../assets/about_icon.png')}
          style={styles.barIcon}
          resizeMode="contain"
        />
        <Text style={styles.barLabel}>Nosotros</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    gap: 2,
  },
  barIcon: {
    width: 32,
    height: 32,
  },
  barLabel: {
    color: '#fff',
    fontSize: 10,
    letterSpacing: 0.4,
  },
});
