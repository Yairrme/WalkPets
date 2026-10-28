import { usarApi } from '../config/api';
import { Rol, Sesion, Usuario } from '../types/paseador';
import { apiFetch } from './api/client';
import { borrarSesionGuardada, guardarSesion, obtenerSesionGuardada } from './sesion.service';

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

type RespuestaAuth = {
  accessToken: string;
  usuario: UsuarioApi;
};

type UsuarioApi = Omit<Usuario, 'telefono'> & { telefono?: string | null };

// El backend devuelve `telefono: null` cuando no hay número; el frontend usa
// `undefined` para "sin teléfono".
function mapUsuario(usuario: UsuarioApi): Usuario {
  return { ...usuario, telefono: usuario.telefono ?? undefined };
}

type UsuarioMock = Usuario & { password: string };

// Usuarios de demostración del modo mock. No son credenciales reales y solo
// existen en memoria cuando EXPO_PUBLIC_DATA_SOURCE no es "api".
const USUARIOS_MOCK: UsuarioMock[] = [
  {
    id: 'demo-cliente',
    nombre: 'Martina',
    apellido: 'Gómez',
    email: 'cliente@walkpets.demo',
    telefono: '+5492994000001',
    rol: 'cliente',
    password: 'demo1234',
  },
  {
    id: 'demo-paseador',
    nombre: 'Lucía',
    apellido: 'Fernández',
    email: 'paseador@walkpets.demo',
    telefono: '+5492994000002',
    rol: 'paseador',
    password: 'demo1234',
  },
];

export const CREDENCIALES_DEMO = {
  cliente: { email: 'cliente@walkpets.demo', password: 'demo1234' },
  paseador: { email: 'paseador@walkpets.demo', password: 'demo1234' },
};

function sesionMock(usuario: Usuario): Sesion {
  return {
    token: `demo-${usuario.id}-${Date.now()}`,
    usuario,
  };
}

function publico({ password: _password, ...usuario }: UsuarioMock): Usuario {
  return usuario;
}

export function esModoDemo(): boolean {
  return !usarApi();
}

export async function iniciarSesion({ email, password }: DatosLogin): Promise<Sesion> {
  const emailLimpio = email.trim().toLowerCase();

  if (usarApi()) {
    const respuesta = await apiFetch<RespuestaAuth>('/auth/login', {
      method: 'POST',
      body: { email: emailLimpio, password },
    });

    const sesion: Sesion = {
      token: respuesta.accessToken,
      usuario: mapUsuario(respuesta.usuario),
    };
    await guardarSesion(sesion);
    return sesion;
  }

  const encontrado = USUARIOS_MOCK.find(
    (usuario) => usuario.email === emailLimpio && usuario.password === password
  );

  if (!encontrado) {
    throw new Error('Correo o contraseña incorrectos.');
  }

  const sesion = sesionMock(publico(encontrado));
  await guardarSesion(sesion);
  return sesion;
}

export async function registrarCuentaCliente(
  datos: DatosRegistroCliente
): Promise<Sesion> {
  const emailLimpio = datos.email.trim().toLowerCase();

  if (usarApi()) {
    const respuesta = await apiFetch<RespuestaAuth>('/auth/registro', {
      method: 'POST',
      body: {
        ...datos,
        email: emailLimpio,
        rol: 'cliente' satisfies Rol,
      },
    });

    const sesion: Sesion = {
      token: respuesta.accessToken,
      usuario: mapUsuario(respuesta.usuario),
    };
    await guardarSesion(sesion);
    return sesion;
  }

  if (USUARIOS_MOCK.some((usuario) => usuario.email === emailLimpio)) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }

  const usuario: UsuarioMock = {
    id: `demo-cliente-${USUARIOS_MOCK.length + 1}`,
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    email: emailLimpio,
    telefono: datos.telefono?.trim() || undefined,
    rol: 'cliente',
    password: datos.password,
  };
  USUARIOS_MOCK.push(usuario);

  const sesion = sesionMock(publico(usuario));
  await guardarSesion(sesion);
  return sesion;
}

// Crea (solo en modo mock) la cuenta asociada al registro de un paseador.
// En modo API esta operación la resuelve POST /auth/registro desde el servicio
// de paseadores.
export async function registrarCuentaPaseadorMock(datos: {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
}): Promise<Sesion> {
  const emailLimpio = datos.email.trim().toLowerCase();

  const existente = USUARIOS_MOCK.find((usuario) => usuario.email === emailLimpio);
  if (existente) {
    const sesion = sesionMock(publico(existente));
    await guardarSesion(sesion);
    return sesion;
  }

  const usuario: UsuarioMock = {
    id: `demo-paseador-${USUARIOS_MOCK.length + 1}`,
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    email: emailLimpio,
    telefono: datos.telefono,
    rol: 'paseador',
    password: datos.password,
  };
  USUARIOS_MOCK.push(usuario);

  const sesion = sesionMock(publico(usuario));
  await guardarSesion(sesion);
  return sesion;
}

export async function obtenerSesionActual(): Promise<Sesion | null> {
  return obtenerSesionGuardada();
}

export async function cerrarSesion(): Promise<void> {
  await borrarSesionGuardada();
}
