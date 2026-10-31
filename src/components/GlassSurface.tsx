import React, { type PropsWithChildren } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GlassView, isGlassEffectAPIAvailable, isLiquidGlassAvailable } from 'expo-glass-effect';
import { BlurView } from 'expo-blur';
import { useAccessibilityPreferences } from '../hooks/useAccessibilityPreferences';

function nativeGlassAvailable() {
  if (Platform.OS !== 'ios') return false;
  try { return isGlassEffectAPIAvailable() && isLiquidGlassAvailable(); } catch { return false; }
}
export default function GlassSurface({ children, style, dark = false }: PropsWithChildren<{ style?: StyleProp<ViewStyle>; dark?: boolean }>) {
  const { reduceTransparency } = useAccessibilityPreferences();
  const color = dark ? '#214B8D' : '#F1F5FC';
  return (
    <View style={[styles.surface, style]}>
      {Platform.OS === 'ios' && !reduceTransparency ? nativeGlassAvailable() ?
        <GlassView pointerEvents="none" colorScheme={dark ? 'dark' : 'light'} glassEffectStyle="regular" tintColor={dark ? 'rgba(24,57,108,0.5)' : 'rgba(255,255,255,0.45)'} style={StyleSheet.absoluteFill} /> :
        <BlurView pointerEvents="none" tint={dark ? 'dark' : 'light'} intensity={70} style={StyleSheet.absoluteFill} /> :
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color }]} />}
      {children}
    </View>
  );
}
const styles = StyleSheet.create({ surface: { overflow: 'hidden' } });
