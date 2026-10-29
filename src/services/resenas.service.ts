import { NuevaResenaInput, Resena } from '../types/paseador';
import { repositorioResenas } from './repositorios';
import { obtenerSesionGuardada } from './sesion.service';

// Casos de uso de reseñas: controlan sesión y rol, y delegan en el repositorio.

export async function crearResena(
  paseadorId: string,
  datos: NuevaResenaInput
): Promise<Resena> {
  const sesion = await obtenerSesionGuardada();
  if (!sesion) {
    throw new Error('Iniciá sesión para publicar una reseña.');
  }

  if (sesion.usuario.rol !== 'cliente') {
    throw new Error('Solo los clientes pueden publicar reseñas.');
  }

  return repositorioResenas().crear(paseadorId, datos, sesion);
}

// Reseñas recibidas por el paseador autenticado.
export async function getMisResenas(): Promise<Resena[]> {
  const sesion = await obtenerSesionGuardada();
  if (!sesion) {
    throw new Error('Iniciá sesión para consultar tus reseñas.');
  }

  if (sesion.usuario.rol !== 'paseador') {
    throw new Error('Solo los paseadores pueden consultar sus reseñas.');
  }

  return repositorioResenas().delPaseadorAutenticado(sesion);
}
