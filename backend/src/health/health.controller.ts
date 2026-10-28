import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Connection } from 'mongoose';

const ESTADOS: Record<number, string> = {
  0: 'desconectado',
  1: 'conectado',
  2: 'conectando',
  3: 'desconectando',
};

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly conexion: Connection) {}

  @Get()
  @ApiOperation({ summary: 'Estado del servicio y de la base de datos' })
  estado() {
    return {
      status: 'ok',
      servicio: 'walkpets-api',
      baseDeDatos: ESTADOS[this.conexion.readyState] ?? 'desconocido',
      timestamp: new Date().toISOString(),
    };
  }
}
