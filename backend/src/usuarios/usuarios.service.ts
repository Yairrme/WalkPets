import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { Model, Types } from 'mongoose';
import { Ciudad } from '../constants/ciudades';
import {
  Rol,
  Usuario,
  UsuarioConPassword,
  UsuarioLean,
} from './schemas/usuario.schema';

const RONDAS_HASH = 10;

export type UsuarioPublico = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  rol: Rol;
  ciudad: Ciudad | null;
  barrio: string;
  mascotas: string;
};

export type CambiosUsuario = Partial<
  Pick<UsuarioPublico, 'nombre' | 'apellido' | 'telefono' | 'ciudad' | 'barrio' | 'mascotas'>
>;

export type CrearUsuarioInput = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string | null;
  rol: Rol;
};

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private readonly modelo: Model<Usuario>
  ) {}

  // Convierte un documento/lean en la forma pública (sin hash ni metadatos).
  publico(usuario: UsuarioLean): UsuarioPublico {
    return {
      id: usuario._id.toString(),
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono ?? null,
      rol: usuario.rol,
      ciudad: usuario.ciudad ?? null,
      barrio: usuario.barrio ?? '',
      mascotas: usuario.mascotas ?? '',
    };
  }

  // Aplica solo los campos enviados y devuelve la cuenta actualizada.
  async actualizar(id: string, cambios: CambiosUsuario): Promise<UsuarioLean | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.modelo
      .findByIdAndUpdate(id, { $set: cambios }, { new: true, runValidators: true })
      .lean<UsuarioLean | null>()
      .exec();
  }

  async crear(datos: CrearUsuarioInput): Promise<UsuarioLean> {
    const email = datos.email.trim().toLowerCase();

    const existente = await this.modelo.exists({ email });
    if (existente) {
      throw new ConflictException('Ya existe una cuenta con ese correo electrónico.');
    }

    const passwordHash = await bcrypt.hash(datos.password, RONDAS_HASH);

    try {
      const creado = await this.modelo.create({
        nombre: datos.nombre.trim(),
        apellido: datos.apellido.trim(),
        email,
        passwordHash,
        telefono: datos.telefono ?? null,
        rol: datos.rol,
      });

      return this.aLean(creado);
    } catch (error) {
      if (this.esDuplicado(error)) {
        throw new ConflictException('Ya existe una cuenta con ese correo electrónico.');
      }
      throw error;
    }
  }

  async buscarPorEmailConPassword(
    email: string
  ): Promise<UsuarioConPassword | null> {
    return this.modelo
      .findOne({ email: email.trim().toLowerCase() })
      .select('+passwordHash')
      .lean<UsuarioConPassword>()
      .exec();
  }

  async buscarPorEmail(email: string): Promise<UsuarioLean | null> {
    return this.modelo
      .findOne({ email: email.trim().toLowerCase() })
      .lean<UsuarioLean | null>()
      .exec();
  }

  async buscarPorId(id: string): Promise<UsuarioLean | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.modelo.findById(id).lean<UsuarioLean>().exec();
  }

  async eliminar(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) return;
    await this.modelo.findByIdAndDelete(id).exec();
  }

  async contar(): Promise<number> {
    return this.modelo.countDocuments().exec();
  }

  private aLean(documento: Usuario & { _id: Types.ObjectId }): UsuarioLean {
    return {
      _id: documento._id,
      nombre: documento.nombre,
      apellido: documento.apellido,
      email: documento.email,
      telefono: documento.telefono ?? null,
      rol: documento.rol,
      ciudad: documento.ciudad ?? null,
      barrio: documento.barrio ?? '',
      mascotas: documento.mascotas ?? '',
    };
  }

  private esDuplicado(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}
