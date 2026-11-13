import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CIUDADES, Ciudad } from '../../constants/ciudades';

// 'admin' no se elige al registrarse: se crea con `npm run crear-admin`.
export const ROLES = ['cliente', 'paseador', 'admin'] as const;
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

  // false = cuenta suspendida por un administrador: no puede iniciar sesión y
  // su token deja de servir.
  @Prop({ default: true })
  activo!: boolean;

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
  activo?: boolean;
  ciudad?: Ciudad | null;
  barrio?: string;
  mascotas?: string;
  createdAt?: Date;
};

export type UsuarioConPassword = UsuarioLean & { passwordHash: string };
