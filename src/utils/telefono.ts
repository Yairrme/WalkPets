// Utilidades de teléfono compartidas por el frontend.
// El objetivo es normalizar números argentinos a un formato apto para `tel:` y
// `https://wa.me/`, sin depender de librerías externas.
//
// Formato interno: 549 + código de área (3 dígitos) + número (7 dígitos).
// Ejemplo: +54 9 299 412-3456  ->  5492994123456

const LARGO_NORMALIZADO = 13;
// Característica de Cipolletti y Neuquén (área 299).
const CARACTERISTICA_LOCAL = '299';

export function normalizarTelefono(valor: string | null | undefined): string | null {
  if (!valor) return null;

  let digitos = valor.replace(/\D/g, '');
  if (!digitos) return null;

  // Prefijo internacional 0054
  if (digitos.startsWith('0054')) {
    digitos = digitos.slice(2);
  }

  if (digitos.startsWith('54')) {
    digitos = digitos.slice(2);
    // El 9 identifica celulares en Argentina.
    if (digitos.startsWith('9')) {
      digitos = digitos.slice(1);
    }
    // Quitamos el 0 de larga distancia si quedó presente.
    if (digitos.startsWith('0')) {
      digitos = digitos.slice(1);
    }
  } else {
    // Número local: quitamos 0 inicial y 9 inicial si vienen incluidos.
    if (digitos.startsWith('0')) digitos = digitos.slice(1);
    if (digitos.startsWith('9')) digitos = digitos.slice(1);
  }

  // Formato local con "15" intercalado: 299 15 4123456.
  if (digitos.length === 12 && digitos.slice(2, 4) === '15') {
    digitos = `${digitos.slice(0, 2)}${digitos.slice(4)}`;
  } else if (digitos.length === 12 && digitos.slice(3, 5) === '15') {
    digitos = `${digitos.slice(0, 3)}${digitos.slice(5)}`;
  }

  // Número local sin característica (4123456 o 15 4123456): en Cipolletti y
  // Neuquén la característica es siempre 299, así que la completamos.
  if (digitos.length === 9 && digitos.startsWith('15')) {
    digitos = `${CARACTERISTICA_LOCAL}${digitos.slice(2)}`;
  } else if (digitos.length === 7) {
    digitos = `${CARACTERISTICA_LOCAL}${digitos}`;
  }

  if (digitos.length !== 10) return null;

  const normalizado = `549${digitos}`;
  return normalizado.length === LARGO_NORMALIZADO ? normalizado : null;
}

export function esTelefonoValido(valor: string | null | undefined): boolean {
  return normalizarTelefono(valor) !== null;
}

// Devuelve un número legible para mostrar en pantalla.
export function formatearTelefono(valor: string | null | undefined): string | null {
  const normalizado = normalizarTelefono(valor);
  if (!normalizado) return null;

  const area = normalizado.slice(3, 6);
  const prefijo = normalizado.slice(6, 10);
  const sufijo = normalizado.slice(10);

  return `+54 9 ${area} ${prefijo}-${sufijo}`;
}

export function construirUrlTel(valor: string | null | undefined): string | null {
  const normalizado = normalizarTelefono(valor);
  return normalizado ? `tel:+${normalizado}` : null;
}

export function construirMensajeWhatsApp(nombre: string): string {
  return `Hola ${nombre}, te contacto desde WalkPets para consultar por el servicio de paseo.`;
}

export function construirUrlWhatsApp(
  valor: string | null | undefined,
  mensaje: string
): string | null {
  const normalizado = normalizarTelefono(valor);
  if (!normalizado) return null;

  return `https://wa.me/${normalizado}?text=${encodeURIComponent(mensaje)}`;
}
