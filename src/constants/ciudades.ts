// Ciudades habilitadas para WalkPets. El backend valida exactamente esta lista.
export const CIUDADES = ['Cipolletti', 'Neuquén'] as const;

export type Ciudad = (typeof CIUDADES)[number];

export function esCiudad(valor: unknown): valor is Ciudad {
  return typeof valor === 'string' && (CIUDADES as readonly string[]).includes(valor);
}

// Barrios conocidos por ciudad. El listado calcula los barrios reales a partir
// de los datos, pero esta lista sirve como referencia para formularios y seeds.
export const BARRIOS_POR_CIUDAD: Record<Ciudad, string[]> = {
  Cipolletti: ['Cipolletti Centro', 'Villa Alberdi', 'Ceferino', 'Brentana'],
  Neuquén: ['Neuquén Centro', 'Alta Barda', 'Bouquet Roldán', 'Confluencia'],
};
