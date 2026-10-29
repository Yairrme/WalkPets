import { Paseador } from '../types/paseador';

// Almacén en memoria del modo mock. Empieza vacío: no hay paseadores de prueba.
// Se llena con los perfiles que se registran desde la app y se pierde al recargar.
// Para trabajar con datos reales usá EXPO_PUBLIC_DATA_SOURCE=api.
export const PASEADORES_MOCK: Paseador[] = [];
