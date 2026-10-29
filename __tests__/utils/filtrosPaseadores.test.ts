import {
  barriosDisponibles,
  FILTROS_INICIALES,
  filtrarPaseadores,
  hayFiltrosActivos,
} from '../../src/utils/filtrosPaseadores';
import { paseadores } from '../fixtures/paseadores';

describe('filtrosPaseadores', () => {
  it('sin filtros devuelve todos en el orden original', () => {
    expect(filtrarPaseadores(paseadores, FILTROS_INICIALES)).toEqual(paseadores);
    expect(hayFiltrosActivos(FILTROS_INICIALES)).toBe(false);
  });

  it('ordena por mejor calificación sin mutar la lista original', () => {
    const original = [...paseadores];
    const resultado = filtrarPaseadores(paseadores, {
      ...FILTROS_INICIALES,
      orden: 'mejor-calificados',
    });

    const calificaciones = resultado.map((p) => p.calificacion);
    expect(calificaciones).toEqual([...calificaciones].sort((a, b) => b - a));
    expect(paseadores).toEqual(original);
  });

  it('ordena por menor precio', () => {
    const resultado = filtrarPaseadores(paseadores, {
      ...FILTROS_INICIALES,
      orden: 'menor-precio',
    });

    const precios = resultado.map((p) => p.precioHora);
    expect(precios).toEqual([...precios].sort((a, b) => a - b));
  });

  it('combina ciudad y disponibilidad', () => {
    const resultado = filtrarPaseadores(paseadores, {
      ...FILTROS_INICIALES,
      ciudad: 'Cipolletti',
      soloDisponibles: true,
    });

    expect(resultado.every((p) => p.ciudad === 'Cipolletti' && p.disponible)).toBe(true);
  });

  it('acota los barrios a la ciudad elegida', () => {
    const barrios = barriosDisponibles(paseadores, 'Neuquén');
    const deNeuquen = paseadores.filter((p) => p.ciudad === 'Neuquén').map((p) => p.barrio);

    expect(barrios.every((b) => deNeuquen.includes(b))).toBe(true);
  });
});
