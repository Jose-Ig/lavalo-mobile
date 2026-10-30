import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Screens
import HomeScreen from './screens/HomeScreen';
import ChooseDateScreen from './screens/ChooseDateScreen';
import ReservationFormScreen from './screens/ReservationFormScreen';
import PaymentScreen from './screens/PaymentScreen';
import SuccessScreen from './screens/SuccessScreen';
import ErrorScreen from './screens/ErrorScreen';
import HaveTurnScreen from './screens/HaveTurnScreen';
import ChangeTurnScreen from './screens/ChangeTurnScreen';
import StartServiceScreen from './screens/StartServiceScreen';
import VerifyTurnScreen from './screens/VerifyTurnScreen';
import ActiveServiceScreen from './screens/ActiveServiceScreen';
import ChooseSubscriptionScreen from './screens/ChooseSubscriptionScreen';
import SubscriptionPaymentScreen from './screens/SubscriptionPaymentScreen';
import SubscriptionSuccessScreen from './screens/SubscriptionSuccessScreen';
import BottomBar from './src/components/BottomBar';

export interface BookingData {
  date: string;
  time: string;
  duration: number;
  espacio: number;
}

export interface ReservationData extends BookingData {
  nombre: string;
  telefono: string;
  patente: string;
  modelo: string;
  dimensiones: string;
}

export interface SubscriptionBooking {
  dayOfWeek: string;
  time: string;
  duration: number;
}

const DAY_OF_WEEK_MAP: Record<string, number> = {
  Domingo: 0, Lunes: 1, Martes: 2, Miércoles: 3,
  Jueves: 4, Viernes: 5, Sábado: 6,
};

/** Cuenta cuántas veces aparece `dayName` en el mes `month` del año `year` (month 0-indexed). */
export function countDayInMonth(dayName: string, year?: number, month?: number): number {
  const today = new Date();
  const y = year ?? today.getFullYear();
  const m = month ?? today.getMonth();
  const targetDay = DAY_OF_WEEK_MAP[dayName] ?? 1;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  let count = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    if (new Date(y, m, d).getDay() === targetDay) count++;
  }
  return count;
}

export interface SubscriptionReservationData {
  nombre: string;
  telefono: string;
  patente: string;
  modelo: string;
  dimensiones: string;
  date: string;
  time: string;
  duration: number;
  espacio: number;
}

// Definición de tipos para las rutas del Stack Navigator
export type RootStackParamList = {
  Home: { toast?: string } | undefined;
  ChooseDate: undefined;
  ReservationForm:
    | { flowType?: 'reservation'; booking: BookingData; subscriptionBooking?: undefined }
    | { flowType: 'subscription'; subscriptionBooking: SubscriptionBooking; booking?: undefined };
  Payment: { reservation: ReservationData };
  Success: { reservation: ReservationData; date: string; time: string };
  Error: undefined;
  HaveTurn: undefined;
  ChangeTurn: undefined;
  StartService: undefined;
  VerifyTurn: undefined;
  ActiveService: undefined;
  ChooseSubscription: undefined;
  SubscriptionPayment: { subscriptionBooking: SubscriptionBooking; reservation: SubscriptionReservationData };
  SubscriptionSuccess: { subscriptionBooking: SubscriptionBooking; renewalDay: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <View style={styles.container}>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#4170be',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '600',
              },
              contentStyle: {
                backgroundColor: '#fbfaf9',
              },
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ChooseDate"
              component={ChooseDateScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
            />
        <Stack.Screen
          name="ReservationForm"
          component={ReservationFormScreen}
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ headerShown: false, animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Success"
          component={SuccessScreen}
          options={{ 
            headerShown: false,
            headerBackVisible: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Error"
          component={ErrorScreen}
          options={{ 
            headerShown: false,
            headerBackVisible: false,
            animation: 'slide_from_bottom',
          }}
        />
            <Stack.Screen
              name="HaveTurn"
              component={HaveTurnScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="ChangeTurn"
              component={ChangeTurnScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="StartService"
              component={StartServiceScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="VerifyTurn"
              component={VerifyTurnScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="ActiveService"
              component={ActiveServiceScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="ChooseSubscription"
              component={ChooseSubscriptionScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="SubscriptionPayment"
              component={SubscriptionPaymentScreen}
              options={{ headerShown: false, animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="SubscriptionSuccess"
              component={SubscriptionSuccessScreen}
              options={{ headerShown: false, headerBackVisible: false, animation: 'slide_from_bottom' }}
            />
          </Stack.Navigator>
          <BottomBar />
        </View>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
