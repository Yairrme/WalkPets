// Ciudades habilitadas en WalkPets. Se validan tanto en DTOs como en los
// esquemas de MongoDB para que no se puedan persistir otras ciudades.
export const CIUDADES = ['Cipolletti', 'Neuquén'] as const;

export type Ciudad = (typeof CIUDADES)[number];

export function esCiudad(valor: unknown): valor is Ciudad {
  return typeof valor === 'string' && (CIUDADES as readonly string[]).includes(valor);
}
