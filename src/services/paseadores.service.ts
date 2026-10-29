import { esCiudad } from '../constants/ciudades';
import { MAX_CERTIFICACIONES } from '../constants/perfil';
import { CambiosPerfilPaseador, NuevoPaseadorInput, Paseador, Sesion } from '../types/paseador';
import { limpiarRedes, validarRedes } from '../utils/redes';
import { normalizarTelefono } from '../utils/telefono';
import { repositorioPaseadores } from './repositorios';
import { guardarSesion, obtenerSesionGuardada } from './sesion.service';

// Casos de uso de paseadores. Validan reglas de negocio y delegan el acceso a
// datos en el repositorio activo (mock o API): no saben de dónde vienen los datos.

export async function getPaseadores(): Promise<Paseador[]> {
  return repositorioPaseadores().listar();
}

// Devuelve null si el paseador no existe.
export async function getPaseadorById(id: string): Promise<Paseador | null> {
  const sesion = await obtenerSesionGuardada();
  return repositorioPaseadores().obtener(id, sesion);
}

function validarDatosRegistro(datos: NuevoPaseadorInput): string {
  if (!esCiudad(datos.ciudad)) {
    throw new Error('La ciudad debe ser Cipolletti o Neuquén');
  }

  const telefonoNormalizado = normalizarTelefono(datos.telefono);
  if (!telefonoNormalizado) {
    throw new Error('El teléfono no es válido');
  }

  return `+${telefonoNormalizado}`;
}

// Redes y certificaciones: mismas reglas en el registro y en el panel.
function normalizarExtras<T extends Pick<CambiosPerfilPaseador, 'redes' | 'certificaciones'>>(datos: T): T {
  const resultado = { ...datos };
  if (datos.redes) {
    const error = validarRedes(datos.redes);
    if (error) throw new Error(error);
    resultado.redes = limpiarRedes(datos.redes);
  }
  if (datos.certificaciones) {
    const unicas = [...new Set(datos.certificaciones.map((c) => c.trim()).filter(Boolean))];
    if (unicas.length > MAX_CERTIFICACIONES) {
      throw new Error(`Podés cargar hasta ${MAX_CERTIFICACIONES} permisos o certificaciones.`);
    }
    resultado.certificaciones = unicas;
  }
  return resultado;
}

async function sesionDePaseador(): Promise<Sesion> {
  const sesion = await obtenerSesionGuardada();
  if (!sesion) throw new Error('Iniciá sesión para editar tu perfil.');
  if (sesion.usuario.rol !== 'paseador') {
    throw new Error('Solo los paseadores tienen un perfil público para editar.');
  }
  return sesion;
}

// Crea la cuenta y el perfil del paseador, y deja la sesión iniciada.
export async function registrarPaseador(datos: NuevoPaseadorInput): Promise<Paseador> {
  const telefono = validarDatosRegistro(datos);
  const { paseador, sesion } = await repositorioPaseadores().registrar(normalizarExtras(datos), telefono);
  if (sesion) await guardarSesion(sesion);
  return paseador;
}

// Panel del paseador: su propio perfil público.
export async function getMiPerfilPaseador(): Promise<Paseador> {
  return repositorioPaseadores().obtenerPropio(await sesionDePaseador());
}

export async function actualizarMiPerfilPaseador(cambios: CambiosPerfilPaseador): Promise<Paseador> {
  const sesion = await sesionDePaseador();
  const datos = normalizarExtras(cambios);
  if (datos.ciudad !== undefined && !esCiudad(datos.ciudad)) {
    throw new Error('La ciudad debe ser Cipolletti o Neuquén');
  }
  return repositorioPaseadores().actualizarPropio(sesion, datos);
}
