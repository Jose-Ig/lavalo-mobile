import { formatSpaceLabel } from '../services/reservationDisplay';
import type { ViewInstance } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { Slot } from '../services/api';
import { homeTheme as colors } from '../theme/home';

type Props = { slots: Slot[]; value: number | null; onChange: (id: number) => void };
type MenuPosition = { top: number; left: number; width: number; maxHeight: number };
export default function SpaceDropdown({ slots, value, onChange }: Props) {
  const anchor = useRef<ViewInstance>(null);
  const { width, height } = useWindowDimensions();
  const [menu, setMenu] = useState<MenuPosition | null>(null);
  const selected = slots.find(slot => slot.id === value);
  useEffect(() => { setMenu(null); }, [slots, width, height]);
  const open = () => {
    anchor.current?.measureInWindow((x, y, fieldWidth, fieldHeight) => {
      const desiredHeight = Math.min(280, slots.length * 56);
      const below = height - y - fieldHeight - 24;
      const above = y - 24;
      const placeBelow = below >= Math.min(desiredHeight, 168) || below >= above;
      const maxHeight = Math.max(56, Math.min(desiredHeight, placeBelow ? below : above));
      setMenu({ left: Math.max(12, Math.min(x, width - fieldWidth - 12)), width: Math.min(fieldWidth, width - 24), maxHeight,
        top: placeBelow ? y + fieldHeight + 8 : Math.max(12, y - maxHeight - 8) });
    });
  };
  return <>
    <View ref={anchor} collapsable={false}>
      <Pressable accessibilityRole="combobox" accessibilityLabel="Elegí tu espacio" accessibilityValue={{ text: selected ? formatSpaceLabel(selected.label) : 'Seleccioná un espacio' }}
        accessibilityState={{ expanded: !!menu }} onPress={open}
        android_ripple={{ color: '#D9E6FF' }} style={({ pressed }) => [styles.field, pressed && styles.pressed]}>
        <Text style={styles.value}>{selected ? formatSpaceLabel(selected.label) : 'Seleccioná un espacio'}</Text>
        <View style={styles.chevron} accessible={false} pointerEvents="none">
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none"><Path d="m6 9 6 6 6-6" stroke={colors.blue} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
        </View>
      </Pressable>
    </View>
    <Modal visible={!!menu} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setMenu(null)}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Cerrar selector de espacios" onPress={() => setMenu(null)} />
        {menu && <View style={[styles.menu, { top: menu.top, left: menu.left, width: menu.width, maxHeight: menu.maxHeight }]}
          accessibilityViewIsModal onAccessibilityEscape={() => setMenu(null)}>
          <FlatList data={slots} keyExtractor={slot => String(slot.id)} style={{ maxHeight: menu.maxHeight }}
            keyboardShouldPersistTaps="handled" initialNumToRender={8} extraData={value}
            renderItem={({ item }) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: item.id === value }}
              onPress={() => { onChange(item.id); setMenu(null); }} android_ripple={{ color: '#D9E6FF' }}
              style={({ pressed }) => [styles.option, item.id === value && styles.selected, pressed && styles.pressed]}>
              <Text style={[styles.optionLabel, item.id === value && styles.selectedLabel]}>{formatSpaceLabel(item.label)}</Text>
            </Pressable>} />
        </View>}
      </View>
    </Modal>
  </>;
}
const styles = StyleSheet.create({
  field: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderRadius: 18, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#BCCCE4', overflow: 'hidden' },
  value: { flex: 1, color: colors.ink, fontSize: 17, lineHeight: 24, fontWeight: '600' },
  chevron: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(15,35,65,0.12)' },
  menu: { position: 'absolute', backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1, borderColor: '#D5DFF0', overflow: 'hidden', elevation: 8, shadowColor: colors.ink, shadowOpacity: 0.15, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  option: { minHeight: 56, paddingHorizontal: 18, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  selected: { backgroundColor: '#E4EDFC' },
  optionLabel: { flex: 1, color: colors.ink, fontSize: 16, lineHeight: 24 },
  selectedLabel: { color: colors.blue },
  pressed: { opacity: 0.8 },
});
