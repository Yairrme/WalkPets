import { RedesSociales } from '../types/paseador';

// Permisos y certificaciones más comunes, para elegir con un toque.
// El paseador también puede escribir uno propio.
export const CERTIFICACIONES_SUGERIDAS = [
  'Habilitación municipal',
  'Primeros auxilios caninos',
  'Adiestramiento canino',
  'Seguro de responsabilidad civil',
  'Estudiante o técnico veterinario',
];

export const MAX_CERTIFICACIONES = 8;

export const REDES_VACIAS: RedesSociales = { instagram: '', facebook: '', tiktok: '', web: '' };
