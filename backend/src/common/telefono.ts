// Normalización de teléfonos argentinos, equivalente a la del frontend.
// Formato interno: 549 + código de área + número (13 dígitos).
const LARGO_NORMALIZADO = 13;

export function normalizarTelefono(valor: string | null | undefined): string | null {
  if (!valor) return null;

  let digitos = valor.replace(/\D/g, '');
  if (!digitos) return null;

  if (digitos.startsWith('0054')) {
    digitos = digitos.slice(2);
  }

  if (digitos.startsWith('54')) {
    digitos = digitos.slice(2);
    if (digitos.startsWith('9')) digitos = digitos.slice(1);
    if (digitos.startsWith('0')) digitos = digitos.slice(1);
  } else {
    if (digitos.startsWith('0')) digitos = digitos.slice(1);
    if (digitos.startsWith('9')) digitos = digitos.slice(1);
  }

  if (digitos.length === 12 && digitos.slice(2, 4) === '15') {
    digitos = `${digitos.slice(0, 2)}${digitos.slice(4)}`;
  } else if (digitos.length === 12 && digitos.slice(3, 5) === '15') {
    digitos = `${digitos.slice(0, 3)}${digitos.slice(5)}`;
  }

  if (digitos.length !== 10) return null;

  const normalizado = `549${digitos}`;
  return normalizado.length === LARGO_NORMALIZADO ? normalizado : null;
}

export function formatearTelefono(valor: string | null | undefined): string | null {
  const normalizado = normalizarTelefono(valor);
  if (!normalizado) return null;

  return `+54 9 ${normalizado.slice(3, 6)} ${normalizado.slice(6, 10)}-${normalizado.slice(10)}`;
}
