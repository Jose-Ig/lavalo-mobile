import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

export interface SubscriptionSelection {
  dayOfWeek: string;
  time: string;
  duration: number;
}

interface SubscriptionSelectorProps {
  onChange?: (selection: SubscriptionSelection) => void;
}

const generateAllHours = (): { label: string; value: string }[] => {
  const hours: { label: string; value: string }[] = [];
  for (let h = 9; h <= 21; h++) {
    const slots = h < 21 ? [0, 15, 30, 45] : [0];
    for (const min of slots) {
      const label = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
      hours.push({ label, value: label });
    }
  }
  return hours;
};

const HOURS = generateAllHours();

const DURATIONS = [
  { label: '15', value: 15 },
  { label: '30', value: 30 },
  { label: '60', value: 60 },
];

const DAYS_OF_WEEK = [
  { label: 'Lunes', value: 'Lunes' },
  { label: 'Martes', value: 'Martes' },
  { label: 'Miércoles', value: 'Miércoles' },
  { label: 'Jueves', value: 'Jueves' },
  { label: 'Viernes', value: 'Viernes' },
  { label: 'Sábado', value: 'Sábado' },
  { label: 'Domingo', value: 'Domingo' },
];

// ─── Generic wheel picker ─────────────────────────────────────────────────────

interface WheelPickerProps<T> {
  data: { label: string; value: T }[];
  selectedIndex: number;
  onSelect: (index: number, value: T) => void;
}

function WheelPicker<T>({ data, selectedIndex, onSelect }: WheelPickerProps<T>) {
  const scrollRef = useRef<ScrollView>(null);
  const momentumActive = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: false });
  }, []);

  const snapToIndex = useCallback(
    (offsetY: number) => {
      const index = Math.max(0, Math.min(Math.round(offsetY / ITEM_HEIGHT), data.length - 1));
      onSelect(index, data[index].value);
      scrollRef.current?.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    },
    [data, onSelect]
  );

  return (
    <View style={wheelStyles.container}>
      <View style={wheelStyles.selectionIndicator} pointerEvents="none" />
      <View style={wheelStyles.gradientTop} pointerEvents="none" />
      <View style={wheelStyles.gradientBottom} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
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
          // On Android velocity is undefined — always schedule a snap in case
          // no momentum follows (user slow-dragged and released).
          const offsetY = e.nativeEvent.contentOffset.y;
          setTimeout(() => {
            if (!momentumActive.current) snapToIndex(offsetY);
          }, 60);
        }}
      >
        {data.map((item, index) => (
          <View key={index} style={wheelStyles.item}>
            <Text style={[wheelStyles.itemText, index === selectedIndex && wheelStyles.itemTextSelected]}>
              {item.label}
            </Text>
          </View>
        ))}
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
  scrollView: { flex: 1 },
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 2,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 2,
    backgroundColor: 'rgba(255,255,255,0.85)',
    zIndex: 2,
  },
});

// ─── Main component ───────────────────────────────────────────────────────────

export default function SubscriptionSelector({ onChange }: SubscriptionSelectorProps) {
  const [dayIndex, setDayIndex] = useState(0);
  const [hourIndex, setHourIndex] = useState(0);
  const [durationIndex, setDurationIndex] = useState(1); // default 30 min

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    onChangeRef.current?.({
      dayOfWeek: DAYS_OF_WEEK[dayIndex].value,
      time: HOURS[hourIndex].value,
      duration: DURATIONS[durationIndex].value,
    });
  }, [dayIndex, hourIndex, durationIndex]);

  const handleDaySelect = useCallback((index: number) => setDayIndex(index), []);
  const handleHourSelect = useCallback((index: number) => setHourIndex(index), []);
  const handleDurationSelect = useCallback((index: number) => setDurationIndex(index), []);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerLabel}>Día</Text>
        <Text style={styles.headerLabel}>Hora</Text>
        <Text style={styles.headerLabel}>Duración (min)</Text>
      </View>

      <View style={styles.wheelsContainer}>
        <WheelPicker
          data={DAYS_OF_WEEK}
          selectedIndex={dayIndex}
          onSelect={handleDaySelect}
        />
        <View style={styles.separator} />
        <WheelPicker
          data={HOURS}
          selectedIndex={hourIndex}
          onSelect={handleHourSelect}
        />
        <View style={styles.separator} />
        <WheelPicker
          data={DURATIONS}
          selectedIndex={durationIndex}
          onSelect={handleDurationSelect}
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {`${DAYS_OF_WEEK[dayIndex].label} · ${HOURS[hourIndex].label} hs · ${DURATIONS[durationIndex].label} min`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
  summary: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginHorizontal: 16,
  },
  summaryText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
    textAlign: 'center',
  },
});
