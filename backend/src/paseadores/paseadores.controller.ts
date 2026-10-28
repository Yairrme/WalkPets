import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';
import { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado';
import { QueryPaseadoresDto } from './dto/paseadores.dto';
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
