import { CambiosPerfilPaseador, Sesion } from '../../types/paseador';
import { apiFetch, ApiError } from '../api/client';
import {
  mapPaseador,
  mapResena,
  mapUsuario,
  PaseadorApi,
  ResenaApi,
  UsuarioApi,
} from '../mappers';
import { RepositorioCuenta, RepositorioPaseadores, RepositorioResenas } from './tipos';

// El modelo del frontend llama "foto" a lo que la API llama "fotoUrl".
function cambiosParaApi({ foto, ...resto }: CambiosPerfilPaseador) {
  return foto === undefined ? resto : { ...resto, fotoUrl: foto };
}

// Implementación contra la API NestJS (EXPO_PUBLIC_DATA_SOURCE=api).

type RespuestaRegistroPaseador = {
  accessToken: string;
  usuario: Omit<Sesion['usuario'], 'telefono'> & { telefono?: string | null };
  paseador: PaseadorApi;
};

export const paseadoresApi: RepositorioPaseadores = {
  async listar() {
    const datos = await apiFetch<PaseadorApi[]>('/paseadores');
    return datos.map(mapPaseador);
  },

  async obtener(id, sesion) {
    try {
      const datos = await apiFetch<PaseadorApi>(`/paseadores/${id}`, { token: sesion?.token });
      return mapPaseador(datos);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null;
      throw error;
    }
  },

  async registrar(datos, telefono) {
    if (!datos.email || !datos.password) {
      throw new Error('El correo y la contraseña son obligatorios para registrarse');
    }

    const respuesta = await apiFetch<RespuestaRegistroPaseador>('/auth/registro', {
      method: 'POST',
      body: {
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        password: datos.password,
        telefono,
        rol: 'paseador',
        paseador: {
          fotoUrl: datos.foto,
          ciudad: datos.ciudad,
          barrio: datos.barrio,
          descripcion: datos.descripcion,
          precioHora: datos.precioHora,
          razasAceptadas: datos.razasAceptadas,
          redes: datos.redes,
          certificaciones: datos.certificaciones,
        },
      },
    });

    const sesion: Sesion = {
      token: respuesta.accessToken,
      usuario: { ...respuesta.usuario, telefono: respuesta.usuario.telefono ?? undefined },
    };
    return { paseador: mapPaseador(respuesta.paseador), sesion };
  },

  async obtenerPropio(sesion) {
    const datos = await apiFetch<PaseadorApi>('/paseadores/mio', { token: sesion.token });
    return mapPaseador(datos);
  },

  async actualizarPropio(sesion, cambios) {
    const datos = await apiFetch<PaseadorApi>('/paseadores/mio', {
      method: 'PATCH',
      token: sesion.token,
      body: cambiosParaApi(cambios),
    });
    return mapPaseador(datos);
  },
};

export const resenasApi: RepositorioResenas = {
  async crear(paseadorId, datos, sesion) {
    const respuesta = await apiFetch<ResenaApi>(`/paseadores/${paseadorId}/resenas`, {
      method: 'POST',
      token: sesion.token,
      body: datos,
    });
    return mapResena(respuesta);
  },

  async delPaseadorAutenticado(sesion) {
    const respuesta = await apiFetch<ResenaApi[]>('/resenas/mias', { token: sesion.token });
    return respuesta.map(mapResena);
  },
};

export const cuentaApi: RepositorioCuenta = {
  async obtener(sesion) {
    return mapUsuario(await apiFetch<UsuarioApi>('/cuenta', { token: sesion.token }));
  },

  async actualizar(sesion, cambios) {
    const respuesta = await apiFetch<UsuarioApi>('/cuenta', {
      method: 'PATCH',
      token: sesion.token,
      // "Sin teléfono" viaja como texto vacío.
      body: { ...cambios, ...(cambios.telefono === undefined ? {} : { telefono: cambios.telefono ?? '' }) },
    });
    return mapUsuario(respuesta);
  },
};
