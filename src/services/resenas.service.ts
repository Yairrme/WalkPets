import { usarApi } from '../config/api';
import { NuevaResenaInput, Resena } from '../types/paseador';
import { apiFetch } from './api/client';
import { agregarResenaMock, getMisResenasMock } from './paseadores.service';
import { obtenerSesionGuardada } from './sesion.service';

type ResenaApi = {
  id: string;
  autorNombre: string;
  mascota: string;
  texto: string;
  calificacion: number;
  fecha: string;
};

function mapResena(dto: ResenaApi): Resena {
  return {
    id: dto.id,
    autor: dto.autorNombre,
    mascota: dto.mascota,
    texto: dto.texto,
    calificacion: dto.calificacion,
    fecha: dto.fecha.slice(0, 10),
  };
}

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

  if (usarApi()) {
    const respuesta = await apiFetch<ResenaApi>(`/paseadores/${paseadorId}/resenas`, {
      method: 'POST',
      token: sesion.token,
      body: datos,
    });
    return mapResena(respuesta);
  }

  return agregarResenaMock(
    paseadorId,
    datos,
    `${sesion.usuario.nombre} ${sesion.usuario.apellido}`
  );
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

  if (usarApi()) {
    const respuesta = await apiFetch<ResenaApi[]>('/resenas/mias', {
      token: sesion.token,
    });
    return respuesta.map(mapResena);
  }

  return getMisResenasMock(sesion.usuario.id);
}
