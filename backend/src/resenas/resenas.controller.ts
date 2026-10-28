import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CrearResenaDto } from './dto/crear-resena.dto';
import { ResenasService } from './resenas.service';

@ApiTags('resenas')
@ApiBearerAuth()
@Controller()
export class ResenasController {
  constructor(private readonly resenas: ResenasService) {}

  @Post('paseadores/:id/resenas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('cliente')
  @ApiOperation({ summary: 'Publica una reseña (solo clientes)' })
  crear(
    @Param('id') id: string,
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Body() dto: CrearResenaDto
  ) {
    return this.resenas.crear(id, usuario, dto);
  }

  @Get('resenas/mias')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('paseador')
  @ApiOperation({ summary: 'Reseñas del perfil propio (solo paseadores)' })
  mias(@UsuarioActual() usuario: UsuarioAutenticado) {
    return this.resenas.mias(usuario);
  }
}
