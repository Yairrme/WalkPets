import { REDES_VACIAS } from '../constants/perfil';
import { Paseador, RedesSociales, Resena, Usuario } from '../types/paseador';

// Contrato de la API NestJS y su traducción al modelo del frontend.
// Un solo lugar para el mapeo evita que cada servicio tenga su propia copia.

export type ResenaApi = {
  id: string;
  autorNombre: string;
  mascota: string;
  texto: string;
  calificacion: number;
  fecha: string;
};

export type PaseadorApi = {
  id: string;
  usuarioId?: string;
  nombre: string;
  apellido: string;
  fotoUrl: string;
  ciudad: string;
  barrio: string;
  descripcion: string;
  precioHora: number;
  telefono: string;
  disponible: boolean;
  razasAceptadas: string[];
  redes?: Partial<RedesSociales>;
  certificaciones?: string[];
  calificacionPromedio: number;
  cantidadResenas: number;
  resenas?: ResenaApi[];
  esPropietario?: boolean;
};

export function mapResena(dto: ResenaApi): Resena {
  return {
    id: dto.id,
    autor: dto.autorNombre,
    mascota: dto.mascota,
    texto: dto.texto,
    calificacion: dto.calificacion,
    fecha: dto.fecha.slice(0, 10),
  };
}

export function mapPaseador(dto: PaseadorApi): Paseador {
  return {
    id: dto.id,
    usuarioId: dto.usuarioId,
    nombre: dto.nombre,
    apellido: dto.apellido,
    foto: dto.fotoUrl ?? '',
    barrio: dto.barrio,
    ciudad: dto.ciudad as Paseador['ciudad'],
    descripcion: dto.descripcion,
    precioHora: dto.precioHora,
    calificacion: dto.calificacionPromedio,
    cantidadResenas: dto.cantidadResenas,
    telefono: dto.telefono,
    disponible: dto.disponible,
    razasAceptadas: dto.razasAceptadas,
    resenas: (dto.resenas ?? []).map(mapResena),
    redes: { ...REDES_VACIAS, ...(dto.redes ?? {}) },
    certificaciones: dto.certificaciones ?? [],
    esPropietario: dto.esPropietario,
  };
}

export type UsuarioApi = Omit<Usuario, 'telefono'> & { telefono?: string | null };

// El backend devuelve `telefono: null` cuando no hay número; el frontend usa
// `undefined` para "sin teléfono".
export function mapUsuario(usuario: UsuarioApi): Usuario {
  return { ...usuario, telefono: usuario.telefono ?? undefined };
}
