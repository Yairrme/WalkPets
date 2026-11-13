import { Rol, Sesion } from '../types/paseador';
import { apiFetch, registrarSesionRechazada } from './api/client';
import { mapUsuario, UsuarioApi } from './mappers';
import { borrarSesionGuardada, guardarSesion, obtenerSesionGuardada } from './sesion.service';

// Autenticación contra el backend: login, registro de clientes y cierre de
// sesión. La sesión (token JWT + datos del usuario) se guarda en AsyncStorage.

export type DatosLogin = {
  email: string;
  password: string;
};

export type DatosRegistroCliente = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono?: string;
};

// Forma de la respuesta de POST /auth/login y POST /auth/registro.
type RespuestaAuth = {
  accessToken: string;
  usuario: UsuarioApi;
};

// Llama a un endpoint de auth, arma la sesión y la deja guardada.
async function autenticar(ruta: string, body: Record<string, unknown>): Promise<Sesion> {
  const respuesta = await apiFetch<RespuestaAuth>(ruta, { method: 'POST', body });
  const sesion: Sesion = { token: respuesta.accessToken, usuario: mapUsuario(respuesta.usuario) };
  await guardarSesion(sesion);
  return sesion;
}

// El correo se compara siempre en minúsculas y sin espacios.
const limpiarEmail = (email: string) => email.trim().toLowerCase();

export function iniciarSesion({ email, password }: DatosLogin): Promise<Sesion> {
  return autenticar('/auth/login', { email: limpiarEmail(email), password });
}

// Los paseadores se registran desde paseadores.service (registrarPaseador),
// porque además de la cuenta crean su perfil público.
export function registrarCuentaCliente(datos: DatosRegistroCliente): Promise<Sesion> {
  return autenticar('/auth/registro', {
    ...datos,
    email: limpiarEmail(datos.email),
    rol: 'cliente' satisfies Rol,
  });
}

export function obtenerSesionActual(): Promise<Sesion | null> {
  return obtenerSesionGuardada();
}

export function cerrarSesion(): Promise<void> {
  return borrarSesionGuardada();
}

// Avisa cuando la API rechaza el token guardado (venció o la cuenta se
// eliminó). Devuelve una función para dejar de escuchar.
export function escucharSesionVencida(alVencer: (token: string) => void): () => void {
  return registrarSesionRechazada(alVencer);
}
