import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'resenas' })
export class Resena {
  @Prop({
    type: SchemaTypes.ObjectId,
    ref: 'Paseador',
    required: true,
    index: true,
  })
  paseador!: Types.ObjectId;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Usuario', required: true })
  autor!: Types.ObjectId;

  // Nombre visible del autor, denormalizado para no exponer datos privados.
  @Prop({ required: true, trim: true })
  autorNombre!: string;

  @Prop({ required: true, trim: true, maxlength: 60 })
  mascota!: string;

  @Prop({ required: true, trim: true, minlength: 10, maxlength: 1000 })
  texto!: string;

  @Prop({ required: true, min: 1, max: 5 })
  calificacion!: number;

  @Prop({ required: true, default: () => new Date() })
  fecha!: Date;
}

export const ResenaSchema = SchemaFactory.createForClass(Resena);
ResenaSchema.index({ paseador: 1, fecha: -1 });
// Un cliente puede reseñar a cada paseador una sola vez.
ResenaSchema.index({ paseador: 1, autor: 1 }, { unique: true });

export type ResenaLean = {
  _id: Types.ObjectId;
  paseador: Types.ObjectId;
  autor: Types.ObjectId;
  autorNombre: string;
  mascota: string;
  texto: string;
  calificacion: number;
  fecha: Date;
};
