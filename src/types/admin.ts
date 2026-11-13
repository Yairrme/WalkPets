import { Rol } from './paseador';

// Tipos de la administración (rol admin). Es la única parte de la app que ve
// correos de otros usuarios.

export type UsuarioAdmin = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  rol: Rol;
  activo: boolean; // false = cuenta suspendida
  creadoEn: string | null; // YYYY-MM-DD
  paseadorId: string | null; // perfil público, si es paseador
};

export type ResenaAdmin = {
  id: string;
  paseadorId: string;
  paseadorNombre: string;
  autorId: string;
  autorNombre: string;
  mascota: string;
  texto: string;
  calificacion: number;
  fecha: string; // YYYY-MM-DD
};

export type PaginaAdmin<T> = {
  items: T[];
  total: number;
  pagina: number;
  porPagina: number;
};

export type FiltrosUsuariosAdmin = {
  rol?: Rol | null;
  q?: string;
  pagina?: number;
};
