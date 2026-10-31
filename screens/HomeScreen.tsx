import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, StyleSheet, Text, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import GlassSurface from '../src/components/GlassSurface';
import { useAccessibilityPreferences } from '../src/hooks/useAccessibilityPreferences';
import { bottomBarHeight, homeTheme as colors } from '../src/theme/home';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
const IOS = Platform.OS === 'ios';

export default function HomeScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { reduceMotion } = useAccessibilityPreferences();
  const [height, setHeight] = useState(0);
  const [logoHeight, setLogoHeight] = useState(96);
  const [actionsHeight, setActionsHeight] = useState(144);
  const [ready, setReady] = useState(false);
  const intro = useRef(new Animated.Value(0)).current;
  const toast = useRef(new Animated.Value(0)).current;
  const toastMessage = route.params?.toast;

  useEffect(() => {
    if (!height || reduceMotion === null) return;
    if (reduceMotion) { intro.setValue(1); setReady(true); return; }
    // The screen is ready once layout/accessibility settings have loaded. No network gate or fake loading loop.
    const animation = Animated.sequence([
      Animated.delay(200),
      Animated.timing(intro, { toValue: 1, duration: 720, easing: Easing.bezier(0.2, 0, 0, 1), useNativeDriver: true }),
    ]);
    animation.start(({ finished }) => { if (finished) setReady(true); });
    return () => animation.stop();
  }, [height, reduceMotion, intro]);

  useEffect(() => {
    if (!toastMessage || !ready) return;
    const animation = Animated.sequence([
      Animated.timing(toast, { toValue: 1, duration: reduceMotion ? 0 : 180, useNativeDriver: true }),
      Animated.delay(2800),
      Animated.timing(toast, { toValue: 0, duration: reduceMotion ? 0 : 180, useNativeDriver: true }),
    ]);
    animation.start();
    return () => animation.stop();
  }, [toastMessage, ready, reduceMotion, toast]);

  const contentCenter = (height + insets.top) / 2;
  const initialLogoCenter = (height + bottomBarHeight(insets.bottom)) / 2;
  const actionsTop = Math.max(contentCenter - actionsHeight / 2, insets.top + logoHeight + 48);
  const finalLogoCenter = actionsTop - 32 - logoHeight / 2;
  const logoY = intro.interpolate({ inputRange: [0, 1], outputRange: [0, finalLogoCenter - initialLogoCenter] });
  const reveal = intro.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, 0, 1] });

  return (
    <View style={styles.screen} onLayout={event => setHeight(event.nativeEvent.layout.height)}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ minHeight: Math.max(height, actionsTop + actionsHeight + 24) }}>
      <Animated.View pointerEvents="none" style={[styles.logoPosition, { top: initialLogoCenter - logoHeight / 2, opacity: height ? 1 : 0, transform: [{ translateY: logoY }] }]} onLayout={event => setLogoHeight(event.nativeEvent.layout.height)}>
        <Text style={styles.logo} accessibilityRole="header" accessibilityLabel="Uash" maxFontSizeMultiplier={1.3}>Uash</Text>
      </Animated.View>

      <Animated.View pointerEvents={ready ? 'auto' : 'none'} accessibilityElementsHidden={!ready} importantForAccessibility={ready ? 'auto' : 'no-hide-descendants'}
        onLayout={event => setActionsHeight(event.nativeEvent.layout.height)}
        style={[styles.actions, { top: actionsTop, opacity: reveal, transform: [{ translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
        <Pressable accessibilityRole="button" accessibilityHint="Elegí un día y horario para tu lavado" disabled={!ready}
          android_ripple={{ color: '#D4E2FB' }} onPress={() => navigation.navigate('ChooseDate')}
          style={({ pressed }) => [styles.button, styles.primary, pressed && styles.primaryPressed]}>
          <Text style={styles.primaryLabel}>Quiero una reserva</Text>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityHint="Consultá el estado de tu reserva y tu pago" disabled={!ready}
          android_ripple={{ color: '#D4E2FB' }} onPress={() => navigation.navigate('CheckoutStatus')}
          style={({ pressed }) => [styles.button, styles.secondary, pressed && styles.secondaryPressed]}>
          {IOS && <GlassSurface dark style={StyleSheet.absoluteFill} />}
          <Text style={styles.secondaryLabel}>Tengo una reserva</Text>
        </Pressable>
      </Animated.View>

      </ScrollView>
      {!!toastMessage && ready && <Animated.View pointerEvents="none" style={[styles.toast, { opacity: toast }]}>
        <Text style={styles.toastLabel} accessibilityLiveRegion="polite">{toastMessage}</Text>
      </Animated.View>}
    </View>
  );
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.blue },
  logoPosition: { position: 'absolute', left: 24, right: 24, alignItems: 'center' },
  logo: { fontSize: 76, lineHeight: 96, fontWeight: '800', letterSpacing: -4, color: colors.onBlue, includeFontPadding: false },
  actions: { position: 'absolute', left: 24, right: 24, alignItems: 'center', gap: 16 },
  button: { width: '100%', maxWidth: 384, minHeight: IOS ? 56 : 64, borderRadius: IOS ? 30 : 32, paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  primary: { backgroundColor: '#FFFFFF', shadowColor: '#173A75', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 2 },
  primaryPressed: { backgroundColor: '#DCE8FD' },
  primaryLabel: { color: colors.ink, fontSize: IOS ? 18 : 20, lineHeight: IOS ? 24 : 28, fontWeight: '700', textAlign: 'center' },
  secondary: { backgroundColor: IOS ? 'transparent' : '#D9E6FF', borderWidth: IOS ? 1 : 0, borderColor: 'rgba(255,255,255,0.32)' },
  secondaryPressed: { opacity: 0.8 },
  secondaryLabel: { color: IOS ? '#FFFFFF' : colors.ink, fontSize: IOS ? 18 : 20, lineHeight: IOS ? 24 : 28, fontWeight: '600', textAlign: 'center' },
  toast: { position: 'absolute', bottom: 20, left: 24, right: 24, borderRadius: 20, backgroundColor: colors.ink, padding: 16 },
  toastLabel: { color: '#FFFFFF', textAlign: 'center', fontSize: 15, lineHeight: 22 },
});
