import { Ciudad } from '../constants/ciudades';
import { normalizarTelefono } from './telefono';

// Validación del formulario de alta de paseador, sin React.
// Devuelve un mapa campo → mensaje; vacío significa que el formulario es válido.

export type FormularioPaseador = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  telefono: string;
  ciudad: Ciudad | '';
  barrio: string;
  precioHora: string;
  descripcion: string;
};

export type ErroresFormulario = Partial<Record<keyof FormularioPaseador | 'general', string>>;

export const MIN_DESCRIPCION = 15;

export function validarRegistroPaseador(datos: FormularioPaseador): ErroresFormulario {
  const errores: ErroresFormulario = {};

  if (!datos.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!datos.apellido.trim()) errores.apellido = 'El apellido es obligatorio';

  const email = datos.email.trim().toLowerCase();
  if (!email) {
    errores.email = 'El correo electrónico es obligatorio';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errores.email = 'Ingresá un correo electrónico válido';
  }

  if (!datos.password) {
    errores.password = 'La contraseña es obligatoria';
  } else if (datos.password.length < 8) {
    errores.password = 'La contraseña debe tener al menos 8 caracteres';
  }

  if (!datos.ciudad) errores.ciudad = 'Seleccioná una ciudad';
  if (!datos.barrio.trim()) errores.barrio = 'El barrio es obligatorio';

  if (!datos.telefono.trim()) {
    errores.telefono = 'El teléfono es obligatorio';
  } else if (!normalizarTelefono(datos.telefono)) {
    errores.telefono = 'Ingresá un teléfono válido (ej. 4123456 o 299 4123456)';
  }

  const precio = Number.parseFloat(datos.precioHora);
  if (!datos.precioHora) {
    errores.precioHora = 'El precio es obligatorio';
  } else if (Number.isNaN(precio) || precio <= 0) {
    errores.precioHora = 'El precio debe ser un número mayor a 0';
  }

  if (datos.descripcion.trim().length < MIN_DESCRIPCION) {
    errores.descripcion = 'Escribe una descripción de al menos 15 caracteres';
  }

  return errores;
}
