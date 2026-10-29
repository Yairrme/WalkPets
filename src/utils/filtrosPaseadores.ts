import { Ciudad } from '../constants/ciudades';
import { Paseador } from '../types/paseador';

// Reglas de búsqueda del listado, sin React: se pueden probar y reutilizar.

export type Orden = 'relevancia' | 'mejor-calificados' | 'menor-precio';

export const ORDENES: { valor: Orden; etiqueta: string }[] = [
  { valor: 'relevancia', etiqueta: 'Recomendados' },
  { valor: 'mejor-calificados', etiqueta: 'Mejor calificados' },
  { valor: 'menor-precio', etiqueta: 'Menor precio' },
];

export type Filtros = {
  ciudad: Ciudad | null;
  barrio: string | null;
  soloDisponibles: boolean;
  orden: Orden;
};

export const FILTROS_INICIALES: Filtros = {
  ciudad: null,
  barrio: null,
  soloDisponibles: false,
  orden: 'relevancia',
};

// Barrios presentes en los datos, acotados a la ciudad elegida.
export function barriosDisponibles(paseadores: Paseador[], ciudad: Ciudad | null): string[] {
  const base = ciudad ? paseadores.filter((p) => p.ciudad === ciudad) : paseadores;
  return [...new Set(base.map((p) => p.barrio))];
}

const COMPARADORES: Record<Orden, ((a: Paseador, b: Paseador) => number) | null> = {
  relevancia: null, // conserva el orden que define la fuente de datos
  'mejor-calificados': (a, b) =>
    b.calificacion - a.calificacion || b.cantidadResenas - a.cantidadResenas,
  'menor-precio': (a, b) => a.precioHora - b.precioHora,
};

export function filtrarPaseadores(paseadores: Paseador[], filtros: Filtros): Paseador[] {
  const filtrados = paseadores.filter((p) => {
    if (filtros.ciudad && p.ciudad !== filtros.ciudad) return false;
    if (filtros.soloDisponibles && !p.disponible) return false;
    if (filtros.barrio && p.barrio !== filtros.barrio) return false;
    return true;
  });

  const comparar = COMPARADORES[filtros.orden];
  return comparar ? [...filtrados].sort(comparar) : filtrados;
}

export function hayFiltrosActivos(filtros: Filtros): boolean {
  return filtros.soloDisponibles || filtros.ciudad !== null || filtros.barrio !== null;
}
