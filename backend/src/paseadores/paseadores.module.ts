import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaseadoresController } from './paseadores.controller';
import { PaseadoresService } from './paseadores.service';
import { Paseador, PaseadorSchema } from './schemas/paseador.schema';
import { Resena, ResenaSchema } from './schemas/resena.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Paseador.name, schema: PaseadorSchema },
      { name: Resena.name, schema: ResenaSchema },
    ]),
  ],
  controllers: [PaseadoresController],
  providers: [PaseadoresService],
  exports: [PaseadoresService, MongooseModule],
})
export class PaseadoresModule {}
