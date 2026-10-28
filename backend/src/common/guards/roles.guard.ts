import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsuarioAutenticado } from '../../auth/interfaces/usuario-autenticado';
import { Rol } from '../../usuarios/schemas/usuario.schema';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requeridos = this.reflector.getAllAndOverride<Rol[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requeridos || requeridos.length === 0) return true;

    const request = context
      .switchToHttp()
      .getRequest<{ user?: UsuarioAutenticado }>();
    const usuario = request.user;

    if (!usuario) {
      throw new UnauthorizedException('Iniciá sesión para continuar.');
    }

    if (!requeridos.includes(usuario.rol)) {
      throw new ForbiddenException(
        'No tenés permisos para realizar esta acción.'
      );
    }

    return true;
  }
}
