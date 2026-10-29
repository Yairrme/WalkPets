import { Usuario } from '../types/paseador';

export type UsuarioMock = Usuario & { password: string };

// Cuentas creadas en modo mock (en memoria). Empieza vacío: no hay cuentas de
// prueba; se registran desde la app y se pierden al recargar.
export const USUARIOS_MOCK: UsuarioMock[] = [];

export function usuarioPublico({ password: _password, ...usuario }: UsuarioMock): Usuario {
  return usuario;
}
