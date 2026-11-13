// ============================================================================
// CONTEXTO: SesionContext
// Guarda la sesión (token + usuario) en memoria para toda la app y la comparte
// con useSesion(). Al iniciar la lee de AsyncStorage; si la API rechaza el token
// (sesión vencida o cuenta eliminada) la cierra sola.
// Uso: const { sesion, iniciar, cerrar } = useSesion();
// ============================================================================

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Sesion } from '../types/paseador';
import {
  cerrarSesion as cerrarSesionServicio,
  escucharSesionVencida,
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

  // Token de la sesión vigente, leído desde el aviso de la API sin volver a
  // registrar el manejador en cada cambio de sesión.
  const tokenActual = useRef<string | null>(null);
  tokenActual.current = sesion?.token ?? null;

  // Si la API rechaza el token de la sesión vigente, se cierra la sesión local
  // para que las pantallas pidan iniciar sesión en lugar de fallar en cada
  // acción. Un 401 de una request con un token anterior (respuesta tardía
  // después de volver a iniciar sesión) se ignora.
  useEffect(
    () =>
      escucharSesionVencida((token) => {
        if (token === tokenActual.current) void cerrar();
      }),
    [cerrar]
  );

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
