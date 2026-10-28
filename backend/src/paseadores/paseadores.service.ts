import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { normalizarTelefono } from '../common/telefono';
import { QueryPaseadoresDto } from './dto/paseadores.dto';
import { PerfilPaseadorDto } from './dto/perfil-paseador.dto';
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
    private readonly resenas: Model<Resena>
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
      calificacionPromedio: perfil.calificacionPromedio,
      cantidadResenas: perfil.cantidadResenas,
    };
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
