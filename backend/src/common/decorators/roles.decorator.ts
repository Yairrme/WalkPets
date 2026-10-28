import { SetMetadata } from '@nestjs/common';
import { Rol } from '../../usuarios/schemas/usuario.schema';

export const ROLES_KEY = 'roles';

// Restringe una ruta a los roles indicados. Se evalúa en RolesGuard.
export const Roles = (...roles: Rol[]) => SetMetadata(ROLES_KEY, roles);
