import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CIUDADES, Ciudad } from '../../constants/ciudades';

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

  // Datos opcionales del perfil del cliente. Nunca se muestran a otros usuarios.
  @Prop({ type: String, enum: [...CIUDADES, null], default: null })
  ciudad?: Ciudad | null;

  @Prop({ type: String, trim: true, maxlength: 80, default: '' })
  barrio?: string;

  @Prop({ type: String, trim: true, maxlength: 300, default: '' })
  mascotas?: string;
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
  ciudad?: Ciudad | null;
  barrio?: string;
  mascotas?: string;
};

export type UsuarioConPassword = UsuarioLean & { passwordHash: string };
