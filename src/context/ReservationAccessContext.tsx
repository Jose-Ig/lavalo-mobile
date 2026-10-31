import React, { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';
import type { ReservationAccess } from '../services/api';

type Access = { code: string; reservation: ReservationAccess } | null;
const Context = createContext<{ access: Access; setAccess: (value: Access) => void } | null>(null);
export function ReservationAccessProvider({ children }: PropsWithChildren) {
  const [access, setAccess] = useState<Access>(null);
  const value = useMemo(() => ({ access, setAccess }), [access]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useReservationAccess() {
  const value = useContext(Context);
  if (!value) throw new Error('ReservationAccessProvider missing');
  return value;
}
