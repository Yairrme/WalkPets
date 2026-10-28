import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsuarioAutenticado } from '../../auth/interfaces/usuario-autenticado';

// Permite rutas públicas que cambian su respuesta si hay sesión (por ejemplo,
// marcar `esPropietario` en el perfil). Si el token falta o es inválido,
// continúa como anónimo en lugar de devolver 401.
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = UsuarioAutenticado | null>(
    _err: unknown,
    user: TUser | false
  ): TUser | null {
    return user || null;
  }
}
