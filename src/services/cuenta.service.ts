import { CambiosCuenta, Usuario } from '../types/paseador';
import { repositorioCuenta } from './repositorios';
import { guardarSesion, obtenerSesionGuardada } from './sesion.service';

// "Mi perfil": datos de la cuenta del usuario autenticado (cliente o paseador).

async function sesionActiva() {
  const sesion = await obtenerSesionGuardada();
  if (!sesion) throw new Error('Iniciá sesión para ver tu perfil.');
  return sesion;
}

export async function getMiCuenta(): Promise<Usuario> {
  return repositorioCuenta().obtener(await sesionActiva());
}

// Guarda los cambios y actualiza la sesión, así el saludo del header y los
// formularios muestran el nombre nuevo sin volver a iniciar sesión.
export async function actualizarMiCuenta(cambios: CambiosCuenta): Promise<Usuario> {
  const sesion = await sesionActiva();

  if (cambios.nombre !== undefined && cambios.nombre.trim().length < 2) {
    throw new Error('El nombre debe tener al menos 2 letras.');
  }
  if (cambios.apellido !== undefined && cambios.apellido.trim().length < 2) {
    throw new Error('El apellido debe tener al menos 2 letras.');
  }

  const usuario = await repositorioCuenta().actualizar(sesion, {
    ...cambios,
    ...(cambios.nombre !== undefined ? { nombre: cambios.nombre.trim() } : {}),
    ...(cambios.apellido !== undefined ? { apellido: cambios.apellido.trim() } : {}),
  });
  await guardarSesion({ ...sesion, usuario });
  return usuario;
}
