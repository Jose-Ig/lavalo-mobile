import * as SecureStore from 'expo-secure-store';
import type { BookingResponse } from './api';

const KEY = 'uash.checkout.v1';
const HISTORY = 'uash.checkout.history.v1';
export interface CheckoutSession { booking: BookingResponse }
// Capability tokens never enter deep links, navigation parameters, or public environment variables.
export async function saveCheckoutSession(booking: BookingResponse): Promise<void> {
  const value = JSON.stringify({ booking });
  await SecureStore.setItemAsync(`uash.checkout.booking.${booking.data.id}`, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  const ids = await checkoutHistory();
  await SecureStore.setItemAsync(HISTORY, JSON.stringify([...new Set([...ids, booking.data.id])].slice(-20)));
  await SecureStore.setItemAsync(KEY, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}
export async function loadCheckoutSession(id?: number): Promise<CheckoutSession | null> {
  const raw = await SecureStore.getItemAsync(id ? `uash.checkout.booking.${id}` : KEY);
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as CheckoutSession;
    if (!Number.isInteger(value.booking?.data?.id) || value.booking.data.id <= 0 ||
        !/^[a-f0-9]{64}$/.test(value.booking.access_token)) return null;
    return value;
  } catch { return null; }
}
export async function clearCheckoutSession(): Promise<void> { await SecureStore.deleteItemAsync(KEY); }

export async function checkoutHistory(): Promise<number[]> {
  const raw = await SecureStore.getItemAsync(HISTORY);
  if (!raw) return [];
  try { const ids: unknown = JSON.parse(raw); return Array.isArray(ids) ? ids.filter(id => Number.isInteger(id) && id > 0).slice(-20) : []; }
  catch { return []; }
}
