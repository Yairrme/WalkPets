import { Module } from '@nestjs/common';
import { PaseadoresModule } from '../paseadores/paseadores.module';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { CuentaController } from './cuenta.controller';
import { CuentaService } from './cuenta.service';

@Module({
  imports: [UsuariosModule, PaseadoresModule],
  controllers: [CuentaController],
  providers: [CuentaService],
})
export class CuentaModule {}
