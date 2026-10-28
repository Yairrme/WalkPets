import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export const ROLES = ['cliente', 'paseador'] as const;
export type Rol = (typeof ROLES)[number];

@Schema({ timestamps: true, collection: 'usuarios' })
export class Usuario {
  @Prop({ required: true, trim: true, maxlength: 60 })
  nombre!: string;

  @Prop({ required: true, trim: true, maxlength: 60 })
  apellido!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  // Nunca se devuelve en las respuestas (select: false).
  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ type: String, trim: true, default: null })
  telefono?: string | null;

  @Prop({ required: true, enum: ROLES, type: String })
  rol!: Rol;
}

export type UsuarioDocument = HydratedDocument<Usuario>;

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

export type UsuarioLean = {
  _id: Types.ObjectId;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  rol: Rol;
};

export type UsuarioConPassword = UsuarioLean & { passwordHash: string };
