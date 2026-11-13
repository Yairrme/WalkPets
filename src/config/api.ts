// Configuración de acceso al backend (NestJS + MongoDB).
// La app tiene una sola fuente de datos: la API en EXPO_PUBLIC_API_URL
// (ej. http://localhost:3000/api). Si falta, cada llamada falla con un mensaje
// claro (ver apiFetch) en vez de mostrar datos falsos.
//
// Expo solo incluye en el bundle las variables que empiezan con EXPO_PUBLIC_:
// nunca pongas secretos acá.

// Sin barra final, porque apiFetch concatena `${API_URL}${path}`.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

// Tiempo máximo de espera de cada request (ms).
export const API_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? '10000');
