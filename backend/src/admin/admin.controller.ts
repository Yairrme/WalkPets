import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsuarioAutenticado } from '../auth/interfaces/usuario-autenticado';
import { Roles } from '../common/decorators/roles.decorator';
import { UsuarioActual } from '../common/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';
import {
  CambiarEstadoUsuarioDto,
  QueryResenasAdminDto,
  QueryUsuariosAdminDto,
} from './dto/admin.dto';

// Gestión de usuarios y moderación de reseñas. Todo el controlador exige el
// rol admin.
@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('usuarios')
  @ApiOperation({ summary: 'Lista y busca cuentas (paginado)' })
  listarUsuarios(@Query() filtros: QueryUsuariosAdminDto) {
    return this.admin.listarUsuarios(filtros);
  }

  @Patch('usuarios/:id/estado')
  @ApiOperation({ summary: 'Suspende o reactiva una cuenta' })
  cambiarEstado(
    @UsuarioActual() usuario: UsuarioAutenticado,
    @Param('id') id: string,
    @Body() datos: CambiarEstadoUsuarioDto
  ) {
    return this.admin.cambiarEstado(usuario.id, id, datos.activo);
  }

  @Delete('usuarios/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Elimina una cuenta, su perfil y sus reseñas' })
  async eliminarUsuario(@UsuarioActual() usuario: UsuarioAutenticado, @Param('id') id: string) {
    await this.admin.eliminarUsuario(usuario.id, id);
  }

  @Get('resenas')
  @ApiOperation({ summary: 'Lista reseñas para moderar (paginado)' })
  listarResenas(@Query() filtros: QueryResenasAdminDto) {
    return this.admin.listarResenas(filtros);
  }

  @Delete('resenas/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Elimina una reseña y recalcula el promedio' })
  async eliminarResena(@Param('id') id: string) {
    await this.admin.eliminarResena(id);
  }
}
