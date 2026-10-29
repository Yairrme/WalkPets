import { PASEADORES_MOCK } from '../../data/paseadores.mock';
import { USUARIOS_MOCK, usuarioPublico } from '../../data/usuarios.mock';
import { Paseador, Resena, Sesion } from '../../types/paseador';
import { normalizarTelefono } from '../../utils/telefono';
import { registrarCuentaPaseadorMock } from '../auth.service';
import { RepositorioCuenta, RepositorioPaseadores, RepositorioResenas } from './tipos';

// Implementación en memoria (modo por defecto y de los tests).
// Simula la latencia de red y las mismas reglas que aplica el backend.

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Reseñas ya publicadas: "paseadorId:usuarioId". Un cliente reseña una sola vez.
const resenasPublicadas = new Set<string>();

// Devolvemos copias para que las pantallas no muten el almacén interno.
function copiar(paseador: Paseador): Paseador {
  return {
    ...paseador,
    razasAceptadas: [...paseador.razasAceptadas],
    resenas: [...paseador.resenas],
    redes: { ...paseador.redes },
    certificaciones: [...paseador.certificaciones],
  };
}

function perfilDe(sesion: Sesion): Paseador {
  const paseador = PASEADORES_MOCK.find((p) => p.usuarioId === sesion.usuario.id);
  if (!paseador) {
    throw new Error('Tu cuenta todavía no tiene un perfil de paseador.');
  }
  return paseador;
}

// Mismo criterio que el backend: teléfono normalizado o error.
function telefonoNormalizado(valor: string): string {
  const normalizado = normalizarTelefono(valor);
  if (!normalizado) throw new Error('El teléfono no es válido.');
  return `+${normalizado}`;
}

function siguienteId(): string {
  const maximo = PASEADORES_MOCK.reduce((max, paseador) => {
    const numero = Number.parseInt(paseador.id, 10);
    return Number.isNaN(numero) ? max : Math.max(max, numero);
  }, 0);
  return String(maximo + 1);
}

export const paseadoresMock: RepositorioPaseadores = {
  async listar() {
    await esperar(900);
    return PASEADORES_MOCK.map(copiar);
  },

  async obtener(id, sesion) {
    await esperar(500);
    const paseador = PASEADORES_MOCK.find((p) => p.id === id);
    if (!paseador) return null;

    return {
      ...copiar(paseador),
      esPropietario: Boolean(sesion && paseador.usuarioId === sesion.usuario.id),
    };
  },

  async registrar(datos, telefono) {
    await esperar(800);

    let sesion = null;
    if (datos.email && datos.password) {
      sesion = await registrarCuentaPaseadorMock({
        nombre: datos.nombre,
        apellido: datos.apellido,
        email: datos.email,
        password: datos.password,
        telefono,
      });
    }

    // La contraseña nunca se guarda junto al perfil público.
    const { email: _email, password: _password, ...perfil } = datos;
    const nuevo: Paseador = {
      ...perfil,
      id: siguienteId(),
      usuarioId: sesion?.usuario.id,
      telefono,
      calificacion: 0,
      cantidadResenas: 0,
      resenas: [],
    };
    PASEADORES_MOCK.push(nuevo);

    return { paseador: copiar(nuevo), sesion };
  },

  async obtenerPropio(sesion) {
    await esperar(300);
    return { ...copiar(perfilDe(sesion)), esPropietario: true };
  },

  async actualizarPropio(sesion, cambios) {
    await esperar(500);
    const perfil = perfilDe(sesion);
    const { telefono, redes, ...resto } = cambios;

    Object.assign(perfil, resto);
    if (redes) perfil.redes = { ...perfil.redes, ...redes };
    if (telefono !== undefined) {
      perfil.telefono = telefonoNormalizado(telefono);
      const cuenta = USUARIOS_MOCK.find((u) => u.id === sesion.usuario.id);
      if (cuenta) cuenta.telefono = perfil.telefono;
    }

    return { ...copiar(perfil), esPropietario: true };
  },
};

export const resenasMock: RepositorioResenas = {
  async crear(paseadorId, datos, sesion) {
    const paseador = PASEADORES_MOCK.find((p) => p.id === paseadorId);
    if (!paseador) {
      throw new Error('Paseador no encontrado');
    }
    if (paseador.usuarioId === sesion.usuario.id) {
      throw new Error('No podés reseñar tu propio perfil.');
    }

    const clave = `${paseadorId}:${sesion.usuario.id}`;
    if (resenasPublicadas.has(clave)) {
      throw new Error('Ya dejaste una reseña para este paseador.');
    }

    const resena: Resena = {
      id: `r-${Date.now()}-${paseador.resenas.length + 1}`,
      autor: `${sesion.usuario.nombre} ${sesion.usuario.apellido}`,
      mascota: datos.mascota,
      texto: datos.texto,
      calificacion: datos.calificacion,
      fecha: new Date().toISOString().slice(0, 10),
    };

    paseador.resenas = [resena, ...paseador.resenas];
    paseador.cantidadResenas = paseador.resenas.length;
    const promedio =
      paseador.resenas.reduce((total, item) => total + item.calificacion, 0) /
      paseador.resenas.length;
    paseador.calificacion = Number(promedio.toFixed(1));
    resenasPublicadas.add(clave);

    return resena;
  },

  async delPaseadorAutenticado(sesion) {
    const paseador = PASEADORES_MOCK.find((p) => p.usuarioId === sesion.usuario.id);
    return paseador ? paseador.resenas.map((resena) => ({ ...resena })) : [];
  },
};

export const cuentaMock: RepositorioCuenta = {
  async obtener(sesion) {
    const cuenta = USUARIOS_MOCK.find((u) => u.id === sesion.usuario.id);
    return cuenta ? usuarioPublico(cuenta) : { ...sesion.usuario };
  },

  async actualizar(sesion, cambios) {
    await esperar(400);
    const cuenta = USUARIOS_MOCK.find((u) => u.id === sesion.usuario.id);
    if (!cuenta) throw new Error('No encontramos tu cuenta.');

    const { telefono, ...resto } = cambios;
    Object.assign(cuenta, resto);
    if (telefono !== undefined) {
      if (!telefono.trim()) {
        if (cuenta.rol === 'paseador') {
          throw new Error('El teléfono es obligatorio para los paseadores.');
        }
        cuenta.telefono = undefined;
      } else {
        cuenta.telefono = telefonoNormalizado(telefono);
      }
    }

    // El perfil público del paseador muestra el mismo nombre y teléfono.
    const perfil = PASEADORES_MOCK.find((p) => p.usuarioId === cuenta.id);
    if (perfil) {
      perfil.nombre = cuenta.nombre;
      perfil.apellido = cuenta.apellido;
      if (cuenta.telefono) perfil.telefono = cuenta.telefono;
    }

    return usuarioPublico(cuenta);
  },
};
