// One server clock for normal, frozen and recovered equipment executions.
export interface TimerReservation {
  status: string;
  end_time: string;
  activation_status: string;
  operational_state?: string;
  operational_reason?: string;
  operational_end_ms?: number;
  remaining_ms?: number;
  timer_frozen?: boolean;
  client_clock_offset_ms?: number;
}

export function remainingMilliseconds(reservation: TimerReservation, now = Date.now()): number {
  if (reservation.status !== 'confirmed' || reservation.activation_status === 'ended' ||
      ['completed', 'closed'].includes(reservation.operational_state ?? '')) return 0;
  if (reservation.timer_frozen || ['controller_unknown', 'controller_offline', 'pending_recovery'].includes(reservation.activation_status)) {
    return Math.max(0, reservation.remaining_ms ?? 0);
  }
  const end = reservation.operational_end_ms ?? Date.parse(reservation.end_time);
  return Math.max(0, end - (now + (reservation.client_clock_offset_ms ?? 0)));
}

export function freezeTimer<T extends TimerReservation>(reservation: T, now = Date.now()): T {
  return { ...reservation, remaining_ms: remainingMilliseconds(reservation, now), timer_frozen: true, activation_status: 'controller_unknown' };
}

export function timerMessage(reservation: TimerReservation): string | null {
  if (reservation.activation_status === 'ended' || ['closed', 'completed'].includes(reservation.operational_state ?? '')) return null;
  if (reservation.activation_status === 'controller_unknown') return 'No hay conexión con el servidor. El tiempo mostrado está pendiente de sincronización.';
  if (reservation.operational_state === 'pending_recovery') {
    return reservation.operational_reason === 'slot_conflict'
      ? 'Tu turno conserva tiempo pendiente. El espacio está reservado y todavía no puede reanudarse. Contactanos para recibir ayuda.'
      : 'Tu turno conserva tiempo pendiente y necesita revisión para reanudarse. Contactanos para recibir ayuda.';
  }
  if (reservation.activation_status === 'controller_offline') return 'Sin comunicación con el espacio. Contador en pausa hasta sincronizar.';
  if (reservation.activation_status === 'controller_unavailable') return 'El dispositivo no está disponible. Contactanos para recibir ayuda.';
  if (reservation.activation_status === 'awaiting_controller') return reservation.operational_state === 'recovering' ? 'Sincronizando el turno con el equipo…' : 'Activando tu espacio…';
  return null;
}
