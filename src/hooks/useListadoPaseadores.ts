import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ciudad } from '../constants/ciudades';
import { getPaseadores } from '../services/paseadores.service';
import { Paseador } from '../types/paseador';
import {
  barriosDisponibles,
  FILTROS_INICIALES,
  Filtros,
  filtrarPaseadores,
  hayFiltrosActivos,
  Orden,
} from '../utils/filtrosPaseadores';

export type EstadoListado = 'cargando' | 'exito' | 'error' | 'vacio';

// Carga de paseadores + estado de filtros. La pantalla solo dibuja.
export function useListadoPaseadores() {
  const [paseadores, setPaseadores] = useState<Paseador[]>([]);
  const [estado, setEstado] = useState<EstadoListado>('cargando');
  const [filtros, setFiltros] = useState<Filtros>(FILTROS_INICIALES);

  const cargar = useCallback(async () => {
    setEstado('cargando');
    try {
      const datos = await getPaseadores();
      setPaseadores(datos);
      setEstado(datos.length === 0 ? 'vacio' : 'exito');
    } catch {
      setEstado('error');
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const barrios = useMemo(
    () => barriosDisponibles(paseadores, filtros.ciudad),
    [paseadores, filtros.ciudad]
  );

  const filtrados = useMemo(() => filtrarPaseadores(paseadores, filtros), [paseadores, filtros]);

  const seleccionarCiudad = (ciudad: Ciudad | null) => {
    setFiltros((actual) => ({
      ...actual,
      ciudad,
      // Si el barrio elegido no existe en la nueva ciudad, se descarta.
      barrio:
        actual.barrio && barriosDisponibles(paseadores, ciudad).includes(actual.barrio)
          ? actual.barrio
          : null,
    }));
  };

  const elegirBarrio = (barrio: string | null) => setFiltros((actual) => ({ ...actual, barrio }));

  const alternarDisponibles = () =>
    setFiltros((actual) => ({ ...actual, soloDisponibles: !actual.soloDisponibles }));

  const ordenar = (orden: Orden) => setFiltros((actual) => ({ ...actual, orden }));

  const limpiar = () => setFiltros((actual) => ({ ...FILTROS_INICIALES, orden: actual.orden }));

  return {
    estado,
    paseadores,
    filtrados,
    barrios,
    filtros,
    filtrosActivos: hayFiltrosActivos(filtros),
    cargar,
    seleccionarCiudad,
    elegirBarrio,
    alternarDisponibles,
    ordenar,
    limpiar,
  };
}
