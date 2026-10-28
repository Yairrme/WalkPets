// Configuración de acceso a datos del frontend.
// - `mock`: usa el arreglo en memoria (por defecto, útil para desarrollo y tests).
// - `api`: usa la API REST de NestJS configurada en EXPO_PUBLIC_API_URL.
//
// Expo solo inyecta en el bundle las variables que empiezan con EXPO_PUBLIC_.
// Nunca coloques secretos en estas variables.

export type FuenteDatos = 'mock' | 'api';

const urlConfigurada = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

export const API_URL = urlConfigurada;

export const FUENTE_DATOS: FuenteDatos =
  (process.env.EXPO_PUBLIC_DATA_SOURCE ?? 'mock') === 'api' ? 'api' : 'mock';

export const API_TIMEOUT_MS = Number(
  process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? '10000'
);

export function usarApi(): boolean {
  return FUENTE_DATOS === 'api' && API_URL.length > 0;
}
