import React from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import GlassSurface from './GlassSurface';
import NavIcon, { type NavIconName } from './NavIcon';
import { homeTheme as colors } from '../theme/home';

const IOS = Platform.OS === 'ios';
const WHATSAPP_NUMBER = '543425145633';
const MAPS_URL = 'https://www.google.com/maps?q=-31.641812,-60.685722';
const INSTAGRAM_URL = 'https://www.instagram.com/jose.ig.prieto';

export default function BottomBar({ activeRoute = 'Home' }: { activeRoute?: string }) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const openExternal = async (url: string, fallback?: string) => {
    try { await Linking.openURL(url); }
    catch {
      try { if (!fallback) throw new Error(); await Linking.openURL(fallback); }
      catch { Alert.alert('No pudimos abrir el enlace', 'Intentá nuevamente en unos instantes.'); }
    }
  };
  const items: { icon: NavIconName; label: string; hint: string; active?: boolean; onPress: () => void }[] = [
    { icon: 'home', label: 'Inicio', hint: 'Ir a la pantalla principal', active: activeRoute === 'Home', onPress: () => navigation.navigate('Home') },
    { icon: 'pin', label: 'Dónde estamos', hint: 'Abrir la ubicación del lavadero en mapas', onPress: () => { void openExternal(IOS ? 'comgooglemaps://?q=-31.641812,-60.685722' : 'geo:0,0?q=-31.641812,-60.685722', MAPS_URL); } },
    { icon: 'whatsapp', label: 'Dudas', hint: 'Abrir una conversación en WhatsApp', onPress: () => { const text = encodeURIComponent('Hola, tengo un problema y necesito ayuda'); void openExternal(`whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${text}`, `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`); } },
    { icon: 'info', label: 'Nosotros', hint: 'Conocer Uash en Instagram', onPress: () => { void openExternal(INSTAGRAM_URL); } },
  ];
  const content = <View style={styles.items}>
    {items.map(item => <Pressable key={item.icon} accessibilityRole="button" accessibilityLabel={item.label} accessibilityHint={item.hint}
      accessibilityState={item.active ? { selected: true } : undefined} onPress={item.onPress}
      android_ripple={{ color: '#CFDAEE', borderless: false }} style={({ pressed }) => [styles.item, pressed && styles.pressed]}>
      <View style={[styles.indicator, item.active && styles.selected]}>
        <NavIcon name={item.icon} color={item.active ? colors.ink : colors.label} size={24} />
      </View>
      <Text style={[styles.label, item.active && styles.selectedLabel]} maxFontSizeMultiplier={1.3}>{item.label}</Text>
    </Pressable>)}
  </View>;
  if (IOS) return <View style={[styles.iosContainer, { paddingBottom: Math.max(insets.bottom, 12), backgroundColor: activeRoute === 'Home' ? colors.blue : '#FBFAF9' }]}>
    <View style={styles.shadow}><GlassSurface style={styles.glass}>{content}</GlassSurface></View>
  </View>;
  return <View style={[styles.androidContainer, { paddingBottom: insets.bottom }]}>{content}</View>;
}
const styles = StyleSheet.create({
  androidContainer: { backgroundColor: colors.androidSurface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#DCE4F5' },
  iosContainer: { paddingTop: 12, paddingHorizontal: 16 },
  shadow: { borderRadius: 36, shadowColor: '#102D58', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 18 },
  glass: { borderRadius: 36, borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(255,255,255,0.65)' },
  items: { flexDirection: 'row', alignItems: 'center', minHeight: IOS ? 72 : 80, paddingHorizontal: IOS ? 6 : 8, paddingVertical: 8 },
  item: { flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: 24, paddingVertical: 2, overflow: 'hidden' },
  pressed: { opacity: 0.7 },
  indicator: { width: 60, height: 32, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  selected: { backgroundColor: IOS ? 'rgba(65,112,190,0.15)' : colors.androidIndicator },
  label: { color: colors.label, fontSize: IOS ? 10 : 12, lineHeight: 16, fontWeight: '500', textAlign: 'center' },
  selectedLabel: { color: colors.ink, fontWeight: '700' },
});
