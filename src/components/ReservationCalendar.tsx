import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import ActionButton from './ActionButton';
import { homeTheme as colors } from '../theme/home';

type Props = { value: string; onSelect: (date: string) => void; onClose: () => void };
export default function ReservationCalendar({ value, onSelect, onClose }: Props) {
 const [day, month, year] = value.split('/').map(Number);
 const [view, setView] = useState(() => new Date(year, month - 1, 1, 12));
 const y = view.getFullYear(), m = view.getMonth();
 const offset = (new Date(y, m, 1, 12).getDay() + 6) % 7;
 const total = new Date(y, m + 1, 0, 12).getDate();
 return <Modal visible transparent animationType="fade" onRequestClose={onClose}>
  <View style={styles.overlay}><View style={styles.sheet} accessibilityViewIsModal>
   <Text style={styles.title}>Fecha del turno</Text>
   <View style={styles.heading}>
    <Pressable accessibilityRole="button" accessibilityLabel="Mes anterior" onPress={() => setView(new Date(y, m - 1, 1, 12))} style={styles.arrow}><Text style={styles.title}>‹</Text></Pressable>
    <Text accessibilityRole="header" style={styles.month}>{view.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Mes siguiente" onPress={() => setView(new Date(y, m + 1, 1, 12))} style={styles.arrow}><Text style={styles.title}>›</Text></Pressable>
   </View>
   <View style={styles.grid}>{['L','M','M','J','V','S','D'].map((label,i) => <View key={i} style={styles.cell}><Text style={styles.weekday}>{label}</Text></View>)}</View>
   <View style={styles.grid}>{Array.from({ length: Math.ceil((offset + total) / 7) * 7 }, (_, i) => {
    const n = i - offset + 1;
    if (n < 1 || n > total) return <View key={i} style={styles.cell} />;
    const selected = n === day && m === month - 1 && y === year;
    return <Pressable key={i} accessibilityRole="button" accessibilityLabel={`${n} de ${view.toLocaleDateString('es-AR',{month:'long'})} de ${y}`} accessibilityState={{ selected }} style={[styles.cell,selected && styles.selected]} onPress={() => onSelect(`${String(n).padStart(2,'0')}/${String(m+1).padStart(2,'0')}/${y}`)}><Text style={[styles.day,selected && styles.selectedText]}>{n}</Text></Pressable>;
   })}</View>
   <ActionButton surface="light" variant="secondary" label="Cerrar" onPress={onClose} />
  </View></View>
 </Modal>;
}
const styles = StyleSheet.create({
 overlay:{flex:1,backgroundColor:'rgba(0,0,0,0.45)',alignItems:'center',justifyContent:'center',padding:20},
 sheet:{width:'100%',maxWidth:420,padding:20,borderRadius:24,backgroundColor:'#FFFFFF',gap:16,alignItems:'center'},
 title:{fontSize:24,fontWeight:'700',color:colors.ink},heading:{flexDirection:'row',alignItems:'center',width:'100%'},month:{flex:1,textAlign:'center',fontSize:17,fontWeight:'600',color:colors.ink,textTransform:'capitalize'},
 arrow:{width:48,minHeight:48,alignItems:'center',justifyContent:'center'},grid:{flexDirection:'row',flexWrap:'wrap',width:'100%'},cell:{width:'14.285714%',minHeight:44,alignItems:'center',justifyContent:'center',borderRadius:24},
 weekday:{color:colors.label,fontWeight:'600'},day:{color:colors.ink,fontSize:17},selected:{backgroundColor:colors.blue},selectedText:{color:'#FFFFFF',fontWeight:'700'},
});
