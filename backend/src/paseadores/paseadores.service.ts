import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { REDES_VACIAS, RedesSociales } from '../common/perfil-extra';
import { normalizarTelefono } from '../common/telefono';
import { UsuariosService } from '../usuarios/usuarios.service';
import { QueryPaseadoresDto } from './dto/paseadores.dto';
import {
  ActualizarPerfilPaseadorDto,
  PerfilPaseadorDto,
} from './dto/perfil-paseador.dto';
import { Paseador, PaseadorLean } from './schemas/paseador.schema';
import { Resena, ResenaLean } from './schemas/resena.schema';

export type ResenaDto = {
  id: string;
  autorNombre: string;
  mascota: string;
  texto: string;
  calificacion: number;
  fecha: string;
};

export type PaseadorDto = {
  id: string;
  usuarioId: string;
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
  redes: RedesSociales;
  certificaciones: string[];
  calificacionPromedio: number;
  cantidadResenas: number;
  resenas?: ResenaDto[];
  esPropietario?: boolean;
};

export type UsuarioParaPerfil = {
  _id: Types.ObjectId;
  nombre: string;
  apellido: string;
  telefono?: string | null;
};

@Injectable()
export class PaseadoresService {
  constructor(
    @InjectModel(Paseador.name)
    private readonly paseadores: Model<Paseador>,
    @InjectModel(Resena.name)
    private readonly resenas: Model<Resena>,
    private readonly usuarios: UsuariosService
  ) {}

  // Convierte un documento lean al contrato público de la API.
  mapear(
    paseador: PaseadorLean,
    opciones: {
      usuarioId?: string | null;
      resenas?: ResenaLean[];
    } = {}
  ): PaseadorDto {
    const dto: PaseadorDto = {
      id: paseador._id.toString(),
      usuarioId: paseador.usuario.toString(),
      nombre: paseador.nombre,
      apellido: paseador.apellido,
      fotoUrl: paseador.fotoUrl ?? '',
      ciudad: paseador.ciudad,
      barrio: paseador.barrio,
      descripcion: paseador.descripcion,
      precioHora: paseador.precioHora,
      telefono: paseador.telefono,
      disponible: paseador.disponible,
      razasAceptadas: [...paseador.razasAceptadas],
      redes: { ...REDES_VACIAS, ...(paseador.redes ?? {}) },
      certificaciones: [...(paseador.certificaciones ?? [])],
      calificacionPromedio: paseador.calificacionPromedio,
      cantidadResenas: paseador.cantidadResenas,
    };

    if (opciones.resenas) {
      dto.resenas = opciones.resenas.map((resena) => this.mapearResena(resena));
    }

    if (opciones.usuarioId) {
      dto.esPropietario = paseador.usuario.toString() === opciones.usuarioId;
    }

    return dto;
  }

  mapearResena(resena: ResenaLean): ResenaDto {
    return {
      id: resena._id.toString(),
      autorNombre: resena.autorNombre,
      mascota: resena.mascota,
      texto: resena.texto,
      calificacion: resena.calificacion,
      fecha: resena.fecha.toISOString(),
    };
  }

  async listar(filtros: QueryPaseadoresDto = {}): Promise<PaseadorDto[]> {
    const consulta: Record<string, unknown> = {};

    if (filtros.ciudad) consulta.ciudad = filtros.ciudad;
    if (filtros.barrio) consulta.barrio = filtros.barrio;
    if (typeof filtros.disponible === 'boolean') {
      consulta.disponible = filtros.disponible;
    }

    const documentos = await this.paseadores
      .find(consulta)
      .sort({ calificacionPromedio: -1, cantidadResenas: -1 })
      .lean<PaseadorLean[]>()
      .exec();

    return documentos.map((paseador) => this.mapear(paseador));
  }

  // Perfil completo con las últimas reseñas.
  async obtener(id: string, usuarioId?: string | null): Promise<PaseadorDto> {
    const paseador = await this.buscarLean(id);
    const resenas = await this.resenas
      .find({ paseador: paseador._id })
      .sort({ fecha: -1 })
      .limit(50)
      .lean<ResenaLean[]>()
      .exec();

    return this.mapear(paseador, { usuarioId, resenas });
  }

  async buscarLean(id: string): Promise<PaseadorLean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('No encontramos ese paseador.');
    }

    const paseador = await this.paseadores
      .findById(id)
      .lean<PaseadorLean | null>()
      .exec();

    if (!paseador) {
      throw new NotFoundException('No encontramos ese paseador.');
    }

    return paseador;
  }

  async buscarPorUsuario(usuarioId: string): Promise<PaseadorLean | null> {
    if (!Types.ObjectId.isValid(usuarioId)) return null;

    return this.paseadores
      .findOne({ usuario: new Types.ObjectId(usuarioId) })
      .lean<PaseadorLean | null>()
      .exec();
  }

  // Crea el perfil público asociado a una cuenta de paseador.
  async crearPerfil(
    usuario: UsuarioParaPerfil,
    datos: PerfilPaseadorDto,
    telefono: string | null | undefined
  ): Promise<PaseadorLean> {
    const telefonoNormalizado = normalizarTelefono(telefono);
    if (!telefonoNormalizado) {
      throw new BadRequestException(
        'El teléfono es obligatorio y debe ser válido para los paseadores.'
      );
    }

    const redes = { ...REDES_VACIAS, ...(datos.redes ?? {}) };
    const certificaciones = datos.certificaciones ?? [];

    const perfil = await this.paseadores.create({
      usuario: usuario._id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      fotoUrl: datos.fotoUrl ?? '',
      ciudad: datos.ciudad,
      barrio: datos.barrio.trim(),
      descripcion: datos.descripcion.trim(),
      precioHora: datos.precioHora,
      telefono: `+${telefonoNormalizado}`,
      disponible: datos.disponible ?? true,
      razasAceptadas:
        datos.razasAceptadas && datos.razasAceptadas.length > 0
          ? datos.razasAceptadas
          : ['Todas las razas'],
      redes,
      certificaciones,
      calificacionPromedio: 0,
      cantidadResenas: 0,
    });

    return {
      _id: perfil._id,
      usuario: perfil.usuario,
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      fotoUrl: perfil.fotoUrl,
      ciudad: perfil.ciudad,
      barrio: perfil.barrio,
      descripcion: perfil.descripcion,
      precioHora: perfil.precioHora,
      telefono: perfil.telefono,
      disponible: perfil.disponible,
      razasAceptadas: perfil.razasAceptadas,
      // Valores planos: el subdocumento de Mongoose no se copia con "...".
      redes,
      certificaciones: [...certificaciones],
      calificacionPromedio: perfil.calificacionPromedio,
      cantidadResenas: perfil.cantidadResenas,
    };
  }

  // Perfil propio del paseador autenticado (panel de edición).
  async obtenerPropio(usuarioId: string): Promise<PaseadorDto> {
    const perfil = await this.buscarPorUsuario(usuarioId);
    if (!perfil) {
      throw new NotFoundException('Tu cuenta todavía no tiene un perfil de paseador.');
    }
    return this.mapear(perfil, { usuarioId });
  }

  // Edita el perfil propio. Solo cambia los campos enviados; el teléfono se
  // normaliza y se mantiene igual en la cuenta y en el perfil público.
  async actualizarPropio(
    usuarioId: string,
    datos: ActualizarPerfilPaseadorDto
  ): Promise<PaseadorDto> {
    const perfil = await this.buscarPorUsuario(usuarioId);
    if (!perfil) {
      throw new NotFoundException('Tu cuenta todavía no tiene un perfil de paseador.');
    }

    const cambios: Record<string, unknown> = {};
    if (datos.fotoUrl !== undefined) cambios.fotoUrl = datos.fotoUrl;
    if (datos.ciudad !== undefined) cambios.ciudad = datos.ciudad;
    if (datos.barrio !== undefined) cambios.barrio = datos.barrio.trim();
    if (datos.descripcion !== undefined) cambios.descripcion = datos.descripcion.trim();
    if (datos.precioHora !== undefined) cambios.precioHora = datos.precioHora;
    if (datos.disponible !== undefined) cambios.disponible = datos.disponible;
    if (datos.razasAceptadas !== undefined) cambios.razasAceptadas = datos.razasAceptadas;
    if (datos.certificaciones !== undefined) cambios.certificaciones = datos.certificaciones;
    if (datos.redes !== undefined) {
      cambios.redes = { ...REDES_VACIAS, ...(perfil.redes ?? {}), ...datos.redes };
    }

    if (datos.telefono !== undefined) {
      const normalizado = normalizarTelefono(datos.telefono);
      if (!normalizado) {
        throw new BadRequestException('El teléfono no es válido.');
      }
      cambios.telefono = `+${normalizado}`;
      await this.usuarios.actualizar(usuarioId, { telefono: cambios.telefono as string });
    }

    const actualizado = await this.paseadores
      .findByIdAndUpdate(perfil._id, { $set: cambios }, { new: true, runValidators: true })
      .lean<PaseadorLean | null>()
      .exec();
    if (!actualizado) {
      throw new NotFoundException('No encontramos tu perfil.');
    }

    return this.mapear(actualizado, { usuarioId });
  }

  // Mantiene el nombre visible del perfil igual al de la cuenta.
  async sincronizarNombre(usuarioId: string, nombre: string, apellido: string): Promise<void> {
    if (!Types.ObjectId.isValid(usuarioId)) return;
    await this.paseadores
      .updateOne({ usuario: new Types.ObjectId(usuarioId) }, { $set: { nombre, apellido } })
      .exec();
  }

  // Recalcula promedio y cantidad de reseñas de forma atómica.
  async recalcularCalificacion(paseadorId: Types.ObjectId): Promise<void> {
    const resultado = await this.resenas
      .aggregate<{ _id: Types.ObjectId; promedio: number; total: number }>([
        { $match: { paseador: paseadorId } },
        {
          $group: {
            _id: '$paseador',
            promedio: { $avg: '$calificacion' },
            total: { $sum: 1 },
          },
        },
      ])
      .exec();

    const datos = resultado[0];
    const promedio = datos ? Number(datos.promedio.toFixed(1)) : 0;
    const total = datos ? datos.total : 0;

    await this.paseadores
      .updateOne(
        { _id: paseadorId },
        { $set: { calificacionPromedio: promedio, cantidadResenas: total } }
      )
      .exec();
  }
}
