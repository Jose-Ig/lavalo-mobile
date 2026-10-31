import React from 'react';
import { Platform, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import GlassSurface from './GlassSurface';
import { homeTheme as colors } from '../theme/home';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  surface?: 'brand' | 'light';
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
};
const IOS = Platform.OS === 'ios';
export default function ActionButton({ label, onPress, disabled = false, variant = 'primary', surface = 'brand', accessibilityHint, style }: Props) {
  const primary = variant === 'primary';
  const danger = variant === 'danger';
  const glass = IOS && variant === 'secondary' && surface === 'brand' && !disabled;
  const backgroundColor = disabled ? '#DFE5EF' : danger ? '#FCE5E7' : primary ? (surface === 'brand' ? '#FFFFFF' : colors.blue) : glass ? 'transparent' : '#D9E6FF';
  const color = disabled ? '#647188' : danger ? '#9B2C3B' : glass || (primary && surface === 'light') ? '#FFFFFF' : colors.ink;
  return <Pressable accessibilityRole="button" accessibilityState={{ disabled }} accessibilityHint={accessibilityHint}
    disabled={disabled} onPress={onPress} android_ripple={{ color: danger ? '#F1B9C1' : surface === 'brand' ? '#C8DAFA' : '#7198D5' }}
    style={({ pressed }) => [styles.button, { backgroundColor }, primary && !disabled && styles.raised, glass && styles.glassBorder, pressed && styles.pressed, style]}>
    {glass && <GlassSurface dark style={StyleSheet.absoluteFill} />}
    <Text style={[styles.label, { color, fontWeight: primary || danger ? '700' : '600' }]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({
  button: { width: '100%', maxWidth: 384, minHeight: IOS ? 56 : 64, borderRadius: IOS ? 30 : 32, paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  raised: { shadowColor: '#173A75', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 2 },
  glassBorder: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)' },
  pressed: { opacity: 0.8 },
  label: { fontSize: IOS ? 18 : 20, lineHeight: IOS ? 24 : 28, textAlign: 'center' },
});
