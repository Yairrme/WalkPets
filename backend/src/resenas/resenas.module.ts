import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaseadoresModule } from '../paseadores/paseadores.module';
import { Resena, ResenaSchema } from '../paseadores/schemas/resena.schema';
import { ResenasController } from './resenas.controller';
import { ResenasService } from './resenas.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Resena.name, schema: ResenaSchema }]),
    PaseadoresModule,
  ],
  controllers: [ResenasController],
  providers: [ResenasService],
})
export class ResenasModule {}
