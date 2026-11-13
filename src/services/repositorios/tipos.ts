import { FiltrosUsuariosAdmin, PaginaAdmin, ResenaAdmin, UsuarioAdmin } from '../../types/admin';
import {
  CambiosCuenta,
  CambiosPerfilPaseador,
  NuevaResenaInput,
  NuevoPaseadorInput,
  Paseador,
  Resena,
  Sesion,
  Usuario,
} from '../../types/paseador';

// Contratos de acceso a datos: qué operaciones ofrece cada repositorio.
// `api.ts` los implementa contra el backend. Tenerlos separados documenta la
// capa de datos de un vistazo y tipa los parámetros de cada método.

export interface RepositorioPaseadores {
  listar(): Promise<Paseador[]>;
  obtener(id: string, sesion: Sesion | null): Promise<Paseador | null>;
  // `telefono` llega ya normalizado (+549...).
  registrar(datos: NuevoPaseadorInput, telefono: string): Promise<{ paseador: Paseador; sesion: Sesion | null }>;
  // Perfil del paseador autenticado (panel de edición).
  obtenerPropio(sesion: Sesion): Promise<Paseador>;
  actualizarPropio(sesion: Sesion, cambios: CambiosPerfilPaseador): Promise<Paseador>;
}

export interface RepositorioResenas {
  crear(paseadorId: string, datos: NuevaResenaInput, sesion: Sesion): Promise<Resena>;
  delPaseadorAutenticado(sesion: Sesion): Promise<Resena[]>;
}

// Administración (rol admin): gestión de cuentas y moderación de reseñas.
export interface RepositorioAdmin {
  listarUsuarios(sesion: Sesion, filtros: FiltrosUsuariosAdmin): Promise<PaginaAdmin<UsuarioAdmin>>;
  cambiarEstado(sesion: Sesion, usuarioId: string, activo: boolean): Promise<UsuarioAdmin>;
  eliminarUsuario(sesion: Sesion, usuarioId: string): Promise<void>;
  listarResenas(sesion: Sesion, pagina: number): Promise<PaginaAdmin<ResenaAdmin>>;
  eliminarResena(sesion: Sesion, resenaId: string): Promise<void>;
}

// Cuenta del usuario autenticado ("Mi perfil").
export interface RepositorioCuenta {
  obtener(sesion: Sesion): Promise<Usuario>;
  actualizar(sesion: Sesion, cambios: CambiosCuenta): Promise<Usuario>;
}
