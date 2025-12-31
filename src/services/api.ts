import axios from 'axios';

// Base URL del API - configurar según el ambiente
const API_BASE_URL = 'https://api.lavalo.com'; // TODO: Configurar URL real

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  (config) => {
    // TODO: Obtener token de almacenamiento seguro
    const token = null; // AsyncStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: Manejar errores globales (401, 500, etc.)
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ============================================
// Servicios de Turnos
// ============================================

export interface Turno {
  id: string;
  fecha: string;
  hora: string;
  servicio: string;
  estado: 'pendiente' | 'confirmado' | 'completado' | 'cancelado';
  codigo: string;
}

export interface DatosReserva {
  nombre: string;
  telefono: string;
  email: string;
  patente: string;
  fecha: string;
  hora: string;
  servicioId: string;
}

// Placeholder: Obtener fechas disponibles
export const getFechasDisponibles = async (mes: string): Promise<string[]> => {
  // TODO: Implementar llamada real
  // return api.get(`/turnos/fechas?mes=${mes}`);
  console.log('API: getFechasDisponibles', mes);
  return ['2025-01-15', '2025-01-16', '2025-01-17'];
};

// Placeholder: Obtener horarios disponibles para una fecha
export const getHorariosDisponibles = async (fecha: string): Promise<string[]> => {
  // TODO: Implementar llamada real
  // return api.get(`/turnos/horarios?fecha=${fecha}`);
  console.log('API: getHorariosDisponibles', fecha);
  return ['09:00', '10:00', '11:00', '14:00', '15:00'];
};

// Placeholder: Crear reserva
export const crearReserva = async (datos: DatosReserva): Promise<Turno> => {
  // TODO: Implementar llamada real
  // return api.post('/turnos', datos);
  console.log('API: crearReserva', datos);
  return {
    id: '123',
    fecha: datos.fecha,
    hora: datos.hora,
    servicio: 'Lavado Completo',
    estado: 'pendiente',
    codigo: 'LAV-001234',
  };
};

// Placeholder: Obtener turno por código
export const getTurnoPorCodigo = async (codigo: string): Promise<Turno | null> => {
  // TODO: Implementar llamada real
  // return api.get(`/turnos/codigo/${codigo}`);
  console.log('API: getTurnoPorCodigo', codigo);
  return {
    id: '123',
    fecha: '2025-01-15',
    hora: '10:00',
    servicio: 'Lavado Completo',
    estado: 'confirmado',
    codigo: codigo,
  };
};

// Placeholder: Cambiar turno
export const cambiarTurno = async (
  turnoId: string,
  nuevaFecha: string,
  nuevaHora: string
): Promise<Turno> => {
  // TODO: Implementar llamada real
  // return api.put(`/turnos/${turnoId}`, { fecha: nuevaFecha, hora: nuevaHora });
  console.log('API: cambiarTurno', turnoId, nuevaFecha, nuevaHora);
  return {
    id: turnoId,
    fecha: nuevaFecha,
    hora: nuevaHora,
    servicio: 'Lavado Completo',
    estado: 'confirmado',
    codigo: 'LAV-001234',
  };
};

// Placeholder: Cancelar turno
export const cancelarTurno = async (turnoId: string): Promise<void> => {
  // TODO: Implementar llamada real
  // return api.delete(`/turnos/${turnoId}`);
  console.log('API: cancelarTurno', turnoId);
};

// Placeholder: Iniciar servicio (escaneo QR)
export const iniciarServicio = async (codigo: string): Promise<Turno> => {
  // TODO: Implementar llamada real
  // return api.post(`/turnos/iniciar`, { codigo });
  console.log('API: iniciarServicio', codigo);
  return {
    id: '123',
    fecha: '2025-01-15',
    hora: '10:00',
    servicio: 'Lavado Completo',
    estado: 'completado',
    codigo: codigo,
  };
};

// ============================================
// Servicios de Pago
// ============================================

export interface DatosPago {
  turnoId: string;
  monto: number;
  metodoPago: string;
}

export interface ResultadoPago {
  exito: boolean;
  transaccionId?: string;
  mensaje: string;
}

// Placeholder: Procesar pago
export const procesarPago = async (datos: DatosPago): Promise<ResultadoPago> => {
  // TODO: Implementar integración con pasarela de pago
  console.log('API: procesarPago', datos);
  return {
    exito: true,
    transaccionId: 'TXN-123456',
    mensaje: 'Pago procesado exitosamente',
  };
};

export default api;

