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

// Contratos de acceso a datos (principio de inversión de dependencias).
// Los servicios dependen de estas interfaces, no de "mock" ni de "fetch":
// agregar otra fuente de datos es sumar una implementación, sin tocar las
// pantallas ni los servicios (abierto/cerrado).

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

// Cuenta del usuario autenticado ("Mi perfil").
export interface RepositorioCuenta {
  obtener(sesion: Sesion): Promise<Usuario>;
  actualizar(sesion: Sesion, cambios: CambiosCuenta): Promise<Usuario>;
}
