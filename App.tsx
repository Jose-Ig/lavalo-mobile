import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

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

// Tipos para los datos de reserva
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

// Definición de tipos para las rutas del Stack Navigator
export type RootStackParamList = {
  Home: undefined;
  ChooseDate: undefined;
  ReservationForm: { booking: BookingData };
  Payment: { reservation: ReservationData };
  Success: undefined;
  Error: undefined;
  HaveTurn: undefined;
  ChangeTurn: undefined;
  StartService: undefined;
  VerifyTurn: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#178fe5',
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
          options={{ title: '' }}
        />
        <Stack.Screen
          name="ReservationForm"
          component={ReservationFormScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="Success"
          component={SuccessScreen}
          options={{ 
            title: '',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="Error"
          component={ErrorScreen}
          options={{ 
            title: '',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="HaveTurn"
          component={HaveTurnScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="ChangeTurn"
          component={ChangeTurnScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="StartService"
          component={StartServiceScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="VerifyTurn"
          component={VerifyTurnScreen}
          options={{ title: '' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
