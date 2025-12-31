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

// Definición de tipos para las rutas del Stack Navigator
export type RootStackParamList = {
  Home: undefined;
  ChooseDate: undefined;
  ReservationForm: undefined;
  Payment: undefined;
  Success: undefined;
  Error: undefined;
  HaveTurn: undefined;
  ChangeTurn: undefined;
  StartService: undefined;
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
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: '#fff',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Lavalo' }}
        />
        <Stack.Screen
          name="ChooseDate"
          component={ChooseDateScreen}
          options={{ title: 'Elegir Fecha' }}
        />
        <Stack.Screen
          name="ReservationForm"
          component={ReservationFormScreen}
          options={{ title: 'Datos de Reserva' }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ title: 'Pago' }}
        />
        <Stack.Screen
          name="Success"
          component={SuccessScreen}
          options={{ 
            title: 'Confirmación',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="Error"
          component={ErrorScreen}
          options={{ 
            title: 'Error',
            headerBackVisible: false,
          }}
        />
        <Stack.Screen
          name="HaveTurn"
          component={HaveTurnScreen}
          options={{ title: 'Mi Turno' }}
        />
        <Stack.Screen
          name="ChangeTurn"
          component={ChangeTurnScreen}
          options={{ title: 'Cambiar Turno' }}
        />
        <Stack.Screen
          name="StartService"
          component={StartServiceScreen}
          options={{ title: 'Iniciar Servicio' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
