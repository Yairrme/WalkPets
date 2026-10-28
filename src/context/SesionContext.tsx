import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Sesion } from '../types/paseador';
import {
  cerrarSesion as cerrarSesionServicio,
  obtenerSesionActual,
} from '../services/auth.service';

type ValorContexto = {
  sesion: Sesion | null;
  cargando: boolean;
  recargar: () => Promise<void>;
  iniciar: (sesion: Sesion) => void;
  cerrar: () => Promise<void>;
};

const SesionContext = createContext<ValorContexto | undefined>(undefined);

export function SesionProvider({ children }: { children: React.ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [cargando, setCargando] = useState(true);

  const recargar = useCallback(async () => {
    const guardada = await obtenerSesionActual();
    setSesion(guardada);
  }, []);

  useEffect(() => {
    let activo = true;

    obtenerSesionActual()
      .then((guardada) => {
        if (activo) setSesion(guardada);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  const iniciar = useCallback((nueva: Sesion) => {
    setSesion(nueva);
  }, []);

  const cerrar = useCallback(async () => {
    await cerrarSesionServicio();
    setSesion(null);
  }, []);

  const valor = useMemo(
    () => ({ sesion, cargando, recargar, iniciar, cerrar }),
    [sesion, cargando, recargar, iniciar, cerrar]
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

const SESION_VACIA: ValorContexto = {
  sesion: null,
  cargando: false,
  recargar: async () => undefined,
  iniciar: () => undefined,
  cerrar: async () => undefined,
};

export function useSesion(): ValorContexto {
  const contexto = useContext(SesionContext);
  // Fuera del provider (por ejemplo en pruebas aisladas) devolvemos una sesión
  // vacía en lugar de romper la pantalla.
  return contexto ?? SESION_VACIA;
}
