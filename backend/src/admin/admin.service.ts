import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PaseadoresService } from '../paseadores/paseadores.service';
import { Paseador } from '../paseadores/schemas/paseador.schema';
import { Resena, ResenaLean } from '../paseadores/schemas/resena.schema';
import { Rol, Usuario, UsuarioLean } from '../usuarios/schemas/usuario.schema';
import { UsuariosService } from '../usuarios/usuarios.service';
import { QueryResenasAdminDto, QueryUsuariosAdminDto } from './dto/admin.dto';

export const POR_PAGINA_ADMIN = 20;

// Vista de una cuenta para el administrador. Es la única respuesta de la API
// que muestra correos de otros usuarios, y solo la recibe el rol admin.
export type UsuarioAdminDto = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  rol: Rol;
  activo: boolean;
  creadoEn: string | null;
  paseadorId: string | null;
};

export type ResenaAdminDto = {
  id: string;
  paseadorId: string;
  paseadorNombre: string;
  autorId: string;
  autorNombre: string;
  mascota: string;
  texto: string;
  calificacion: number;
  fecha: string;
};

export type PaginaAdmin<T> = {
  items: T[];
  total: number;
  pagina: number;
  porPagina: number;
};

export type DatosAdmin = {
  email: string;
  password: string;
  nombre?: string;
  apellido?: string;
};

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// La búsqueda llega del usuario: se escapa para usarla como texto literal.
function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Usuario.name) private readonly usuariosModelo: Model<Usuario>,
    @InjectModel(Paseador.name) private readonly paseadoresModelo: Model<Paseador>,
    @InjectModel(Resena.name) private readonly resenasModelo: Model<Resena>,
    private readonly usuarios: UsuariosService,
    private readonly paseadores: PaseadoresService
  ) {}

  async listarUsuarios(filtros: QueryUsuariosAdminDto): Promise<PaginaAdmin<UsuarioAdminDto>> {
    const consulta: Record<string, unknown> = {};
    if (filtros.rol) consulta.rol = filtros.rol;
    // Las cuentas anteriores a este campo no lo tienen y cuentan como activas.
    if (filtros.activo === true) consulta.activo = { $ne: false };
    if (filtros.activo === false) consulta.activo = false;

    const texto = filtros.q?.trim();
    if (texto) {
      const patron = new RegExp(escaparRegex(texto), 'i');
      consulta.$or = [{ nombre: patron }, { apellido: patron }, { email: patron }];
    }

    const pagina = filtros.pagina ?? 1;
    const [documentos, total] = await Promise.all([
      this.usuariosModelo
        .find(consulta)
        .sort({ createdAt: -1 })
        .skip((pagina - 1) * POR_PAGINA_ADMIN)
        .limit(POR_PAGINA_ADMIN)
        .lean<UsuarioLean[]>()
        .exec(),
      this.usuariosModelo.countDocuments(consulta).exec(),
    ]);

    const perfiles = await this.paseadoresModelo
      .find({ usuario: { $in: documentos.map((usuario) => usuario._id) } })
      .select('_id usuario')
      .lean<{ _id: Types.ObjectId; usuario: Types.ObjectId }[]>()
      .exec();
    const perfilPorUsuario = new Map(
      perfiles.map((perfil) => [perfil.usuario.toString(), perfil._id.toString()])
    );

    return {
      items: documentos.map((usuario) =>
        this.mapearUsuario(usuario, perfilPorUsuario.get(usuario._id.toString()) ?? null)
      ),
      total,
      pagina,
      porPagina: POR_PAGINA_ADMIN,
    };
  }

  // Suspende o reactiva una cuenta. El perfil de paseador asociado se oculta
  // mientras la cuenta está suspendida.
  async cambiarEstado(
    adminId: string,
    usuarioId: string,
    activo: boolean
  ): Promise<UsuarioAdminDto> {
    const objetivo = await this.objetivoModificable(adminId, usuarioId);

    await this.usuariosModelo.updateOne({ _id: objetivo._id }, { $set: { activo } }).exec();
    const perfil = await this.paseadoresModelo
      .findOneAndUpdate(
        { usuario: objetivo._id },
        { $set: { suspendido: !activo } },
        { new: true }
      )
      .select('_id')
      .lean<{ _id: Types.ObjectId } | null>()
      .exec();

    return this.mapearUsuario({ ...objetivo, activo }, perfil ? perfil._id.toString() : null);
  }

  // Borrado definitivo: la cuenta, su perfil de paseador con las reseñas que
  // recibió, y las reseñas que escribió (recalculando los promedios afectados).
  async eliminarUsuario(adminId: string, usuarioId: string): Promise<void> {
    const objetivo = await this.objetivoModificable(adminId, usuarioId);

    const perfil = await this.paseadoresModelo
      .findOne({ usuario: objetivo._id })
      .select('_id')
      .lean<{ _id: Types.ObjectId } | null>()
      .exec();
    if (perfil) {
      await this.resenasModelo.deleteMany({ paseador: perfil._id }).exec();
      await this.paseadoresModelo.deleteOne({ _id: perfil._id }).exec();
    }

    const afectados = (await this.resenasModelo
      .distinct('paseador', { autor: objetivo._id })
      .exec()) as Types.ObjectId[];
    await this.resenasModelo.deleteMany({ autor: objetivo._id }).exec();
    for (const paseadorId of afectados) {
      await this.paseadores.recalcularCalificacion(paseadorId);
    }

    await this.usuariosModelo.deleteOne({ _id: objetivo._id }).exec();
  }

  async listarResenas(filtros: QueryResenasAdminDto): Promise<PaginaAdmin<ResenaAdminDto>> {
    const consulta: Record<string, unknown> = {};
    if (filtros.paseadorId) consulta.paseador = new Types.ObjectId(filtros.paseadorId);

    const pagina = filtros.pagina ?? 1;
    const [resenas, total] = await Promise.all([
      this.resenasModelo
        .find(consulta)
        .sort({ fecha: -1 })
        .skip((pagina - 1) * POR_PAGINA_ADMIN)
        .limit(POR_PAGINA_ADMIN)
        .lean<ResenaLean[]>()
        .exec(),
      this.resenasModelo.countDocuments(consulta).exec(),
    ]);

    const perfiles = await this.paseadoresModelo
      .find({ _id: { $in: resenas.map((resena) => resena.paseador) } })
      .select('_id nombre apellido')
      .lean<{ _id: Types.ObjectId; nombre: string; apellido: string }[]>()
      .exec();
    const nombrePorPerfil = new Map(
      perfiles.map((perfil) => [perfil._id.toString(), `${perfil.nombre} ${perfil.apellido}`])
    );

    return {
      items: resenas.map((resena) => ({
        id: resena._id.toString(),
        paseadorId: resena.paseador.toString(),
        paseadorNombre: nombrePorPerfil.get(resena.paseador.toString()) ?? '',
        autorId: resena.autor.toString(),
        autorNombre: resena.autorNombre,
        mascota: resena.mascota,
        texto: resena.texto,
        calificacion: resena.calificacion,
        fecha: resena.fecha.toISOString(),
      })),
      total,
      pagina,
      porPagina: POR_PAGINA_ADMIN,
    };
  }

  async eliminarResena(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('No encontramos esa reseña.');
    }

    const resena = await this.resenasModelo
      .findByIdAndDelete(id)
      .lean<ResenaLean | null>()
      .exec();
    if (!resena) {
      throw new NotFoundException('No encontramos esa reseña.');
    }

    await this.paseadores.recalcularCalificacion(resena.paseador);
  }

  // Usado por `npm run crear-admin`. Crea la cuenta de administrador o, si ya
  // existe como admin, le asigna la contraseña indicada y la reactiva. No
  // convierte en admin una cuenta de cliente o paseador.
  async crearAdmin(datos: DatosAdmin): Promise<'creado' | 'actualizado'> {
    const email = datos.email.trim().toLowerCase();
    if (!EMAIL_VALIDO.test(email)) {
      throw new BadRequestException('ADMIN_EMAIL no es un correo válido.');
    }
    if (datos.password.length < 8 || datos.password.length > 72) {
      throw new BadRequestException('ADMIN_PASSWORD debe tener entre 8 y 72 caracteres.');
    }

    const existente = await this.usuarios.buscarPorEmail(email);
    if (existente) {
      if (existente.rol !== 'admin') {
        throw new BadRequestException(
          `Ya existe una cuenta de ${existente.rol} con ese correo. Usá otro ADMIN_EMAIL.`
        );
      }
      await this.usuarios.cambiarPassword(existente._id.toString(), datos.password);
      return 'actualizado';
    }

    await this.usuarios.crear({
      nombre: datos.nombre?.trim() || 'Administración',
      apellido: datos.apellido?.trim() || 'WalkPets',
      email,
      password: datos.password,
      telefono: null,
      rol: 'admin',
    });
    return 'creado';
  }

  // El admin no puede suspender ni borrar su propia cuenta ni otras de admin.
  private async objetivoModificable(adminId: string, usuarioId: string): Promise<UsuarioLean> {
    if (adminId === usuarioId) {
      throw new BadRequestException('No podés modificar tu propia cuenta desde la administración.');
    }

    const objetivo = await this.usuarios.buscarPorId(usuarioId);
    if (!objetivo) {
      throw new NotFoundException('No encontramos esa cuenta.');
    }
    if (objetivo.rol === 'admin') {
      throw new ForbiddenException('No se pueden modificar otras cuentas de administrador.');
    }

    return objetivo;
  }

  private mapearUsuario(usuario: UsuarioLean, paseadorId: string | null): UsuarioAdminDto {
    return {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono ?? null,
      rol: usuario.rol,
      activo: usuario.activo !== false,
      creadoEn: usuario.createdAt ? new Date(usuario.createdAt).toISOString() : null,
      paseadorId,
    };
  }
}
