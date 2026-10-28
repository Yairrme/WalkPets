import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UsuarioAutenticado } from '../../auth/interfaces/usuario-autenticado';

// Inyecta el usuario resuelto por JwtStrategy en el controlador.
export const UsuarioActual = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UsuarioAutenticado | null => {
    const request = ctx.switchToHttp().getRequest<{ user?: UsuarioAutenticado }>();
    return request.user ?? null;
  }
);
