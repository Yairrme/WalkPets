import { usarApi } from '../config/api';
import { USUARIOS_MOCK, UsuarioMock, usuarioPublico } from '../data/usuarios.mock';
import { Rol, Sesion, Usuario } from '../types/paseador';
import { apiFetch } from './api/client';
import { mapUsuario, UsuarioApi } from './mappers';
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


function sesionMock(usuario: Usuario): Sesion {
  return {
    token: `mock-${usuario.id}-${Date.now()}`,
    usuario,
  };
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

  const sesion = sesionMock(usuarioPublico(encontrado));
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
    id: `cliente-${USUARIOS_MOCK.length + 1}`,
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    email: emailLimpio,
    telefono: datos.telefono?.trim() || undefined,
    rol: 'cliente',
    password: datos.password,
  };
  USUARIOS_MOCK.push(usuario);

  const sesion = sesionMock(usuarioPublico(usuario));
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

  // Igual que el backend: un correo ya registrado no puede volver a usarse
  // (antes devolvía la sesión de esa cuenta sin pedir su contraseña).
  if (USUARIOS_MOCK.some((usuario) => usuario.email === emailLimpio)) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }

  const usuario: UsuarioMock = {
    id: `paseador-${USUARIOS_MOCK.length + 1}`,
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    email: emailLimpio,
    telefono: datos.telefono,
    rol: 'paseador',
    password: datos.password,
  };
  USUARIOS_MOCK.push(usuario);

  const sesion = sesionMock(usuarioPublico(usuario));
  await guardarSesion(sesion);
  return sesion;
}

export async function obtenerSesionActual(): Promise<Sesion | null> {
  return obtenerSesionGuardada();
}

export async function cerrarSesion(): Promise<void> {
  await borrarSesionGuardada();
}
