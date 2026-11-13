import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaseadoresModule } from '../paseadores/paseadores.module';
import { Paseador, PaseadorSchema } from '../paseadores/schemas/paseador.schema';
import { Resena, ResenaSchema } from '../paseadores/schemas/resena.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  imports: [
    UsuariosModule,
    PaseadoresModule,
    MongooseModule.forFeature([
      { name: Usuario.name, schema: UsuarioSchema },
      { name: Paseador.name, schema: PaseadorSchema },
      { name: Resena.name, schema: ResenaSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
