// Configuración de acceso a datos del frontend.
// - `api` (por defecto): la app real. Usa la API NestJS + MongoDB en EXPO_PUBLIC_API_URL.
// - `mock`: datos en memoria que se pierden al recargar. Solo para desarrollo y
//   tests, y hay que pedirlo explícitamente con EXPO_PUBLIC_DATA_SOURCE=mock.
//
// Antes, si faltaba la URL la app pasaba a mock sin avisar y los registros
// "funcionaban" pero no llegaban a la base. Ahora, sin URL, las llamadas fallan
// con un mensaje claro (ver apiFetch) y el modo mock muestra un aviso visible.
//
// Expo solo inyecta en el bundle las variables que empiezan con EXPO_PUBLIC_.
// Nunca coloques secretos en estas variables.

export type FuenteDatos = 'mock' | 'api';

const urlConfigurada = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

export const API_URL = urlConfigurada;

export const FUENTE_DATOS: FuenteDatos =
  (process.env.EXPO_PUBLIC_DATA_SOURCE ?? '').trim() === 'mock' ? 'mock' : 'api';

export const API_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? '10000'
);

export function usarApi(): boolean {
  return FUENTE_DATOS === 'api';
}
