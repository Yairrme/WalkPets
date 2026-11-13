import { FiltrosUsuariosAdmin, PaginaAdmin, ResenaAdmin, UsuarioAdmin } from '../types/admin';
import { Sesion } from '../types/paseador';
import { adminApi } from './repositorios/api';
import { obtenerSesionGuardada } from './sesion.service';

// Casos de uso de la administración. El servidor vuelve a controlar el rol;
// acá se corta antes para dar un mensaje claro.

async function sesionAdmin(): Promise<Sesion> {
  const sesion = await obtenerSesionGuardada();
  if (!sesion) {
    throw new Error('Iniciá sesión como administrador para continuar.');
  }
  if (sesion.usuario.rol !== 'admin') {
    throw new Error('Esta sección es solo para administradores.');
  }
  return sesion;
}

export async function listarUsuariosAdmin(
  filtros: FiltrosUsuariosAdmin = {}
): Promise<PaginaAdmin<UsuarioAdmin>> {
  return adminApi.listarUsuarios(await sesionAdmin(), filtros);
}

// activo = false suspende la cuenta; true la reactiva.
export async function cambiarEstadoUsuario(
  usuarioId: string,
  activo: boolean
): Promise<UsuarioAdmin> {
  return adminApi.cambiarEstado(await sesionAdmin(), usuarioId, activo);
}

export async function eliminarUsuarioAdmin(usuarioId: string): Promise<void> {
  return adminApi.eliminarUsuario(await sesionAdmin(), usuarioId);
}

export async function listarResenasAdmin(pagina = 1): Promise<PaginaAdmin<ResenaAdmin>> {
  return adminApi.listarResenas(await sesionAdmin(), pagina);
}

export async function eliminarResenaAdmin(resenaId: string): Promise<void> {
  return adminApi.eliminarResena(await sesionAdmin(), resenaId);
}
