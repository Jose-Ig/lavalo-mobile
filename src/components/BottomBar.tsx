import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
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
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }} accessibilityLabel="⌂">⌂</Text>
        <Text style={styles.barLabel}>Inicio</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.barItem}
        onPress={handleMapsPress}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }} accessibilityLabel="⌖">⌖</Text>
        <Text style={styles.barLabel}>Donde estamos</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.barItem}
        onPress={handleWhatsAppPress}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }} accessibilityLabel="?">?</Text>
        <Text style={styles.barLabel}>Dudas</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.barItem}
        onPress={handleInstagramPress}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: '#fff' }} accessibilityLabel="ⓘ">ⓘ</Text>
        <Text style={styles.barLabel}>Nosotros</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
    gap: 2,
  },
  barIcon: {
    width: 24,
    height: 24,
  },
  barLabel: {
    color: '#fff',
    fontSize: 9,
    letterSpacing: 0.3,
  },
});
