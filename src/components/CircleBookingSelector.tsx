import type { ScrollViewInstance } from 'react-native';
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export interface BookingSelection {
  date: string;
  time: string;
  duration: number;
  espacio: number;
}

interface CircleBookingSelectorProps {
  initialSelection?: BookingSelection;
  defaultDuration?: number;
  fixedDuration?: boolean;
  onChange?: (selection: BookingSelection | null) => void;
}

// Generar próximos 8 días (hoy + 7)
const generateDays = (): { label: string; value: string; isToday: boolean }[] => {
  const days = [];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  
  for (let i = 0; i < 8; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dayNum = date.getDate();
    const dayName = i === 0 ? 'Hoy' : dayNames[date.getDay()];
    days.push({
      label: i === 0 ? `Hoy ${dayNum}` : `${dayName} ${dayNum}`,
      value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      isToday: i === 0,
    });
  }
  return days;
};

// Generar todos los horarios desde 8:00 hasta 22:00 en intervalos de 30 min
const generateAllHours = (): { label: string; value: string; minutes: number }[] => {
  const hours: { label: string; value: string; minutes: number }[] = [];
  for (let h = 9; h <= 21; h++) {
    const hour = h.toString().padStart(2, '0');
    const slots = h < 21 ? [0, 15, 30, 45] : [0];
    for (const min of slots) {
      const minute = min.toString().padStart(2, '0');
      hours.push({
        label: `${hour}:${minute}`,
        value: `${hour}:${minute}`,
        minutes: h * 60 + min,
      });
    }
  }
  return hours;
};

// Obtener minutos actuales desde medianoche
const getCurrentMinutes = (): number => {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
};

// Duraciones disponibles
const DURATIONS = [
  { label: '15', value: 15 },
  { label: '30', value: 30 },
  { label: '60', value: 60 },
];

// Espacios de lavado disponibles
const ESPACIOS = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
];

const DAYS = generateDays();
const ALL_HOURS = generateAllHours();

// Componente de rueda individual
interface WheelPickerProps<T> {
  data: { label: string; value: T }[];
  selectedIndex: number;
  onSelect: (index: number, value: T) => void;
}

function WheelPicker<T>({ data, selectedIndex, onSelect }: WheelPickerProps<T>) {
  const scrollViewRef = useRef<ScrollViewInstance>(null);
  const momentumActive = useRef(false);

  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, [selectedIndex, data]);

  const snapToIndex = useCallback(
    (offsetY: number) => {
      const index = Math.max(0, Math.min(Math.round(offsetY / ITEM_HEIGHT), data.length - 1));
      if (!data.length) return;
      onSelect(index, data[index].value);
      scrollViewRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    },
    [data, onSelect]
  );

  return (
    <View style={wheelStyles.container}>
      {/* Indicador de selección */}
      <View style={wheelStyles.selectionIndicator} pointerEvents="none" />
      
      {/* Gradientes superior e inferior */}
      <View style={wheelStyles.gradientTop} pointerEvents="none" />
      <View style={wheelStyles.gradientBottom} pointerEvents="none" />
      
      <ScrollView
        ref={scrollViewRef}
        style={wheelStyles.scrollView}
        contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        nestedScrollEnabled
        onMomentumScrollBegin={() => { momentumActive.current = true; }}
        onMomentumScrollEnd={(e) => {
          momentumActive.current = false;
          snapToIndex(e.nativeEvent.contentOffset.y);
        }}
        onScrollEndDrag={(e) => {
          const offsetY = e.nativeEvent.contentOffset.y;
          setTimeout(() => {
            if (!momentumActive.current) snapToIndex(offsetY);
          }, 60);
        }}
      >
        {data.map((item, index) => {
          const isSelected = index === selectedIndex;
          return (
            <View key={index} style={wheelStyles.item}>
              <Text style={[
                wheelStyles.itemText,
                isSelected && wheelStyles.itemTextSelected,
              ]}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const wheelStyles = StyleSheet.create({
  container: {
    flex: 1,
    height: PICKER_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 18,
    color: '#999',
    fontWeight: '400',
  },
  itemTextSelected: {
    color: '#333',
    fontWeight: '600',
    fontSize: 20,
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 4,
    right: 4,
    height: ITEM_HEIGHT,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    zIndex: 1,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 2,
    pointerEvents: 'none',
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 2,
    pointerEvents: 'none',
  },
});

export default function CircleBookingSelector({
  initialSelection,
  defaultDuration = 15,
  fixedDuration = false,
  onChange,
}: CircleBookingSelectorProps) {
  const [dayIndex, setDayIndex] = useState(() => Math.max(0, DAYS.findIndex(day => day.value === initialSelection?.date)));
  const [hourIndex, setHourIndex] = useState(() => {
    if (!initialSelection) return 0;
    const day = DAYS.find(day => day.value === initialSelection.date) || DAYS[0];
    const hours = ALL_HOURS.filter(hour => hour.minutes + initialSelection.duration <= 21 * 60 && (!day.isToday || hour.minutes >= getCurrentMinutes() + 30));
    return Math.max(0, hours.findIndex(hour => hour.value === initialSelection.time));
  });
  const [durationIndex, setDurationIndex] = useState(
    Math.max(0, DURATIONS.findIndex(d => d.value === (initialSelection?.duration || defaultDuration)))
  );

  // Usar ref para evitar loop infinito
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Filtrar horarios disponibles según el día seleccionado
  const availableHours = useMemo(() => {
    const isToday = DAYS[dayIndex].isToday;
    
    if (!isToday) {
      // Si no es hoy, todos los horarios están disponibles
      return ALL_HOURS.filter(hour => hour.minutes + DURATIONS[durationIndex].value <= 21 * 60);
    }
    
    // Si es hoy, filtrar horarios pasados
    const currentMinutes = getCurrentMinutes();
    // Agregar 30 minutos de margen para dar tiempo a llegar
    const minMinutes = currentMinutes + 30;
    
    return ALL_HOURS.filter(hour => hour.minutes >= minMinutes && hour.minutes + DURATIONS[durationIndex].value <= 21 * 60);
  }, [dayIndex, durationIndex]);

  // Ajustar hourIndex cuando cambian los horarios disponibles
  useEffect(() => {
    if (hourIndex >= availableHours.length) {
      setHourIndex(0);
    }
  }, [availableHours, hourIndex]);

  // Notificar cambios solo cuando cambian los índices
  useEffect(() => {
    if (availableHours.length > 0 && hourIndex < availableHours.length) {
      onChangeRef.current?.({
        date: DAYS[dayIndex].value,
        time: availableHours[hourIndex].value,
        duration: DURATIONS[durationIndex].value,
        espacio: 1,
      });
    } else { onChangeRef.current?.(null); }
  }, [dayIndex, hourIndex, durationIndex, availableHours]);

  const handleDaySelect = useCallback((index: number) => {
    setDayIndex(index);
    setHourIndex(0);
  }, []);

  const handleHourSelect = useCallback((index: number) => {
    setHourIndex(index);
  }, []);

  const handleDurationSelect = useCallback((index: number) => {
    setDurationIndex(index);
  }, []);

  // Si no hay horarios disponibles para hoy
  const noHoursAvailable = availableHours.length === 0;

  return (
    <View style={styles.container}>
      {/* Header con labels */}
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Día de la semana</Text>
        <Text style={styles.headerLabel}>Hora de inicio</Text>
        {!fixedDuration && <Text style={styles.headerLabel}>Duración (minutos)</Text>}
      </View>

      {/* Ruedas */}
      <View style={styles.wheelsContainer}>
        {/* Rueda de día */}
        <WheelPicker
          data={DAYS}
          selectedIndex={dayIndex}
          onSelect={handleDaySelect}
        />

        {/* Separador */}
        <View style={styles.separator} />

        {/* Rueda de hora */}
        {noHoursAvailable ? (
          <View style={styles.noHoursContainer}>
            <Text style={styles.noHoursText}>No hay</Text>
            <Text style={styles.noHoursText}>horarios</Text>
            <Text style={styles.noHoursSubtext}>Elegí otro día</Text>
          </View>
        ) : (
          <WheelPicker
            data={availableHours}
            selectedIndex={hourIndex}
            onSelect={handleHourSelect}
          />
        )}

        {!fixedDuration && <>
        {/* Separador */}
        <View style={styles.separator} />

        {/* Rueda de duración */}
        <WheelPicker
          data={DURATIONS}
          selectedIndex={durationIndex}
          onSelect={handleDurationSelect}
        />
        </>}
      </View>

      {/* Resumen de selección */}
      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {noHoursAvailable 
            ? 'Seleccioná otro día'
            : `${DAYS[dayIndex].label} • ${availableHours[hourIndex]?.label || ''} • ${DURATIONS[durationIndex].label} min`
          }
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  wheelsContainer: {
    flexDirection: 'row',
    width: '100%',
    height: PICKER_HEIGHT,
    paddingHorizontal: 10,
  },
  separator: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: ITEM_HEIGHT,
  },
  noHoursContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noHoursText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  noHoursSubtext: {
    fontSize: 12,
    color: '#000',
    marginTop: 8,
  },
  summary: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
  },
  summaryText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
});
