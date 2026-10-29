import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado';
import { QueryPaseadoresDto } from './dto/paseadores.dto';
import { ActualizarPerfilPaseadorDto } from './dto/perfil-paseador.dto';
import { PaseadoresService } from './paseadores.service';

@ApiTags('paseadores')
@Controller('paseadores')
export class PaseadoresController {
  constructor(private readonly paseadores: PaseadoresService) {}

  @Get()
  @ApiOperation({ summary: 'Lista paseadores con filtros opcionales' })
  listar(@Query() filtros: QueryPaseadoresDto) {
    return this.paseadores.listar(filtros);
  }

  // Va antes de ":id" para que "mio" no se interprete como un id.
  @Get('mio')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('paseador')
  @ApiOperation({ summary: 'Perfil propio del paseador autenticado' })
  obtenerPropio(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.paseadores.obtenerPropio(usuario.id);
  }

  @Patch('mio')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('paseador')
  @ApiOperation({ summary: 'Edita el perfil propio (panel del paseador)' })
  actualizarPropio(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() datos: ActualizarPerfilPaseadorDto
  ) {
    return this.paseadores.actualizarPropio(usuario.id, datos);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Perfil público con sus últimas reseñas' })
  obtener(
    @Param('id') id: string,
    @UsuarioActual() usuario: UsuarioAutenticado | null
  ) {
    return this.paseadores.obtener(id, usuario?.id ?? null);
  }
}
