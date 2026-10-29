import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado';
import {
  PaseadoresService,
  ResenaDto,
} from '../paseadores/paseadores.service';
import { Resena, ResenaLean } from '../paseadores/schemas/resena.schema';
import { CrearResenaDto } from './dto/crear-resena.dto';

const RESENA_DUPLICADA = 'Ya dejaste una reseña para este paseador.';

@Injectable()
export class ResenasService {
  constructor(
    @InjectModel(Resena.name)
    private readonly resenas: Model<Resena>,
    private readonly paseadores: PaseadoresService
  ) {}

  // Publica una reseña de un cliente y actualiza el promedio del perfil.
  async crear(
    paseadorId: string,
    usuario: UsuarioAutenticado,
    datos: CrearResenaDto
  ): Promise<ResenaDto> {
    const paseador = await this.paseadores.buscarLean(paseadorId);

    if (paseador.usuario.toString() === usuario.id) {
      throw new BadRequestException('No podés reseñar tu propio perfil.');
    }

    const autor = new Types.ObjectId(usuario.id);
    if (await this.resenas.exists({ paseador: paseador._id, autor })) {
      throw new ConflictException(RESENA_DUPLICADA);
    }

    let creada;
    try {
      creada = await this.resenas.create({
        paseador: paseador._id,
        autor,
        autorNombre: `${usuario.nombre} ${usuario.apellido}`.trim(),
        mascota: datos.mascota.trim(),
        texto: datos.texto.trim(),
        calificacion: datos.calificacion,
        fecha: new Date(),
      });
    } catch (error) {
      // Dos envíos simultáneos: el índice único frena el segundo.
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException(RESENA_DUPLICADA);
      }
      throw error;
    }

    await this.paseadores.recalcularCalificacion(paseador._id);

    return this.paseadores.mapearResena({
      _id: creada._id,
      paseador: creada.paseador,
      autor: creada.autor,
      autorNombre: creada.autorNombre,
      mascota: creada.mascota,
      texto: creada.texto,
      calificacion: creada.calificacion,
      fecha: creada.fecha,
    });
  }

  // Reseñas recibidas por el perfil del paseador autenticado.
  async mias(usuario: UsuarioAutenticado): Promise<ResenaDto[]> {
    const perfil = await this.paseadores.buscarPorUsuario(usuario.id);
    if (!perfil) {
      throw new NotFoundException(
        'Tu cuenta todavía no tiene un perfil de paseador.'
      );
    }

    const resenas = await this.resenas
      .find({ paseador: perfil._id })
      .sort({ fecha: -1 })
      .lean<ResenaLean[]>()
      .exec();

    return resenas.map((resena) => this.paseadores.mapearResena(resena));
  }
}
