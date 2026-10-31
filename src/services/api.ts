import axios from 'axios';
import type { ReservationData } from '../../App';

// On a physical phone use the LAN address of the development computer.
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});
export interface Slot { id: number; label: string; is_available: boolean }
export interface Reservation {
  reservation_number: string;
  id: number;
  email?: string;
  whatsapp_opt_in?: boolean;
  slot_id: number;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  expires_at?: string;
}
export interface BookingResponse { data: Reservation; access_token: string }
// The business operates in Argentina (UTC-03:00). Device timezone must not shift a booking.
export const bookingStart = (date: string, time: string) => `${date}T${time}:00-03:00`;
export async function getAvailableSlots(date: string, time: string, duration: number): Promise<Slot[]> {
  const response = await api.get<{ data: Slot[] }>('/available-slots', {
    params: { start_time: bookingStart(date, time), duration_minutes: duration, _ts: Date.now() },
    headers: { 'Cache-Control': 'no-cache' },
  });
  if (!Array.isArray(response.data.data)) throw new Error('Invalid availability response');
  return response.data.data;
}
export async function createReservation(r: ReservationData): Promise<BookingResponse> {
  const response = await api.post<BookingResponse>('/reservations', {
    start_time: bookingStart(r.date, r.time),
    duration_minutes: r.duration, name: r.nombre, email: r.email?.trim() || undefined, phone: r.telefono,
  });
  return response.data;
}
export async function getReservation(id: number, token: string): Promise<Reservation> {
  const response = await api.get<{ data: Reservation }>(`/reservations/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}
export async function cancelReservation(id: number, token: string): Promise<void> {
  await api.delete(`/reservations/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}
export function apiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.code === 'payment_provider_authorization') return 'No pudimos abrir Mercado Pago. El servicio de pagos requiere revisión. Contactanos para recibir ayuda.';
    if (error.response?.status === 503) return 'No pudimos verificar el pago. Consultá nuevamente antes de pagar otra vez.';
    if (error.response?.status === 404) return 'No encontramos la reserva o todavía no se preparó su checkout.';
    if (error.response?.status === 409) return 'Ese espacio ya no está disponible. Elegí otro turno.';
    if (error.response?.status === 400) return 'Revisá los datos y elegí un horario futuro dentro de 09:00 a 21:00.';
    if (!error.response) return 'No pudimos conectar con Uash. Revisá tu conexión e intentá nuevamente.';
  }
  return 'No pudimos completar la operación. Intentá nuevamente.';
}
export default api;

export interface CheckoutStatus {
  reservation_number: string;
  confirmation_code?: string;
  notification_status?: string;
  id: number;
  reservation_id: number;
  amount_cents: number;
  currency: string;
  status: 'creating' | 'pending' | 'failed' | 'completed' | 'review' | 'refunded' | 'expired';
  issue?: string;
  expires_at: string;
  checkout_url?: string;
  reservation_status: Reservation['status'];
  verified: boolean;
}
export async function startCheckout(id: number, token: string): Promise<CheckoutStatus> {
  const response = await api.post<{ data: CheckoutStatus }>(`/reservations/${id}/checkout`, {}, {
    headers: { Authorization: `Bearer ${token}` }, timeout: 25000,
  });
  return response.data.data;
}
export async function getCheckoutStatus(id: number, token: string): Promise<CheckoutStatus> {
  const response = await api.get<{ data: CheckoutStatus }>(`/reservations/${id}/payment`, {
    headers: { Authorization: `Bearer ${token}` }, timeout: 25000,
  });
  return response.data.data;
}

export interface ReservationAccess {
 can_reschedule: boolean;
 reservation_number: string; reservation_date: string;
 id: number; code: string; slot_id: number; slot_label: string;
 start_time: string; end_time: string; duration_minutes: number;
 status: Reservation['status']; can_verify_qr: boolean; activation_reason: string;
 qr_verified_at?: string; activation_status: 'not_started' | 'awaiting_controller';
}
export async function lookupReservationCode(code: string, date: string): Promise<ReservationAccess> {
 const result = await api.post<{ data: ReservationAccess }>('/reservations/lookup', { code, date });
 return result.data.data;
}
export async function verifyReservationSlot(code: string, qr: string, date: string): Promise<ReservationAccess> {
 const result = await api.post<{ data: ReservationAccess }>('/reservations/verify-slot', { code, qr, date });
 return result.data.data;
}
export function reservationAccessError(error: unknown): string {
 if (axios.isAxiosError(error)) {
  if (error.response?.status === 404) return 'No encontramos una reserva con ese código y fecha. Revisá ambos datos.';
  if (error.response?.status === 429) return 'Esperá un minuto antes de intentar nuevamente.';
  if (error.response?.status === 409) return 'Verificá el espacio asignado y el horario de tu turno. La reserva debe estar confirmada.';
  if (error.response?.status === 400) return 'El QR no corresponde a un espacio de Uash.';
 }
 return 'No pudimos verificar la reserva. Revisá la conexión e intentá nuevamente.';
}

export async function getRescheduleSlots(code: string, date: string, selection: { date: string; time: string }): Promise<Slot[]> {
 const response = await api.post<{ data: Slot[] }>('/reservations/reschedule/availability', { code, date, start_time: bookingStart(selection.date, selection.time) });
 return response.data.data;
}
export async function rescheduleReservation(code: string, date: string, selection: { date: string; time: string }): Promise<ReservationAccess> {
 const response = await api.post<{ data: ReservationAccess }>('/reservations/reschedule', { code, date, start_time: bookingStart(selection.date, selection.time) });
 return response.data.data;
}
export function rescheduleError(error: unknown): string {
 if (axios.isAxiosError(error)) {
  if (error.response?.status === 409) return 'El turno ya no está disponible o la reserva ya comenzó o fue validada. Consultá nuevamente la reserva y elegí otro turno.';
  if (error.response?.status === 400) return 'Elegí un horario futuro dentro de 09:00 a 21:00 y los próximos 8 días.';
 }
 return reservationAccessError(error);
}
