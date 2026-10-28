import { Rol } from '../../usuarios/schemas/usuario.schema';

// Usuario resuelto por JwtStrategy y disponible en `request.user`.
export type UsuarioAutenticado = {
  id: string;
  email: string;
  nombre: string;
  apellido: string;
  rol: Rol;
};

export type JwtPayload = {
  sub: string;
  email: string;
  rol: Rol;
};
