import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';
import { REDES_VACIAS, RedesSociales } from '../../common/perfil-extra';
import { CIUDADES, Ciudad } from '../../constants/ciudades';

@Schema({ timestamps: true, collection: 'paseadores' })
export class Paseador {
  // Cada perfil pertenece a una única cuenta de usuario.
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Usuario',
    required: true,
    unique: true,
    index: true,
  })
  usuario!: Types.ObjectId;

  @Prop({ required: true, trim: true, maxlength: 60 })
  nombre!: string;

  @Prop({ required: true, trim: true, maxlength: 60 })
  apellido!: string;

  @Prop({ trim: true, default: '' })
  fotoUrl!: string;

  @Prop({ required: true, enum: CIUDADES, type: String, index: true })
  ciudad!: Ciudad;

  @Prop({ required: true, trim: true, maxlength: 80 })
  barrio!: string;

  @Prop({ required: true, trim: true, minlength: 15, maxlength: 1000 })
  descripcion!: string;

  @Prop({ required: true, min: 1 })
  precioHora!: number;

  // Teléfono normalizado (549 + área + número). Obligatorio para trabajadores.
  @Prop({ required: true, trim: true })
  telefono!: string;

  @Prop({ default: true })
  disponible!: boolean;

  @Prop({ type: [String], default: ['Todas las razas'] })
  razasAceptadas!: string[];

  @Prop({
    type: { instagram: String, facebook: String, tiktok: String, web: String },
    _id: false,
    default: () => ({ ...REDES_VACIAS }),
  })
  redes!: RedesSociales;

  @Prop({ type: [String], default: [] })
  certificaciones!: string[];

  @Prop({ default: 0, min: 0, max: 5 })
  calificacionPromedio!: number;

  @Prop({ default: 0, min: 0 })
  cantidadResenas!: number;
}

export const PaseadorSchema = SchemaFactory.createForClass(Paseador);

export type PaseadorLean = {
  _id: Types.ObjectId;
  usuario: Types.ObjectId;
  nombre: string;
  apellido: string;
  fotoUrl: string;
  ciudad: Ciudad;
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
};
