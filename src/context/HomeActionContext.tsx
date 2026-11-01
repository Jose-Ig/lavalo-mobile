import React, { createContext, useCallback, useContext, useMemo, useRef, type PropsWithChildren } from 'react';

type Handler = () => void;
type HomeAction = { register: (handler: Handler) => () => void; requestHome: (fallback: Handler) => void };
const Context = createContext<HomeAction | null>(null);
export function HomeActionProvider({ children }: PropsWithChildren) {
  const handler = useRef<Handler | null>(null);
  const register = useCallback((next: Handler) => {
    handler.current = next;
    return () => { if (handler.current === next) handler.current = null; };
  }, []);
  const requestHome = useCallback((fallback: Handler) => {
    if (handler.current) handler.current(); else fallback();
  }, []);
  const value = useMemo(() => ({ register, requestHome }), [register, requestHome]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useHomeAction() {
  const context = useContext(Context);
  if (!context) throw new Error('HomeActionProvider is required');
  return context;
}
