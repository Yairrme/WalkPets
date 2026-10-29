import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CuentaService } from './cuenta.service';
import { ActualizarCuentaDto } from './dto/actualizar-cuenta.dto';

@ApiTags('cuenta')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cuenta')
export class CuentaController {
  constructor(private readonly cuenta: CuentaService) {}

  @Get()
  @ApiOperation({ summary: 'Datos de la cuenta propia' })
  obtener(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.cuenta.obtener(usuario.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Edita los datos de la cuenta propia' })
  actualizar(@UsuarioActual() usuario: UsuarioAutenticado, @Body() datos: ActualizarCuentaDto) {
    return this.cuenta.actualizar(usuario.id, datos);
  }
}
