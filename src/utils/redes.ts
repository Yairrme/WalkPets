import { RedesSociales } from '../types/paseador';

// Validación y enlaces de redes sociales. Mismas reglas que el backend
// (backend/src/common/perfil-extra.ts).

export type Red = keyof RedesSociales;

const PATRONES: Record<Red, RegExp> = {
  instagram: /^[A-Za-z0-9._]{1,30}$/,
  facebook: /^[A-Za-z0-9.]{1,50}$/,
  tiktok: /^[A-Za-z0-9._]{1,30}$/,
  web: /^https?:\/\/\S+$/,
};

// Quita espacios y "@" inicial de los usuarios. La web se deja como está.
export function limpiarRed(red: Red, valor: string): string {
  const recortado = valor.trim();
  return red === 'web' ? recortado : recortado.replace(/^@+/, '');
}

export function esRedValida(red: Red, valor: string): boolean {
  const limpio = limpiarRed(red, valor);
  return limpio === '' || PATRONES[red].test(limpio);
}

export function limpiarRedes(redes: RedesSociales): RedesSociales {
  return {
    instagram: limpiarRed('instagram', redes.instagram),
    facebook: limpiarRed('facebook', redes.facebook),
    tiktok: limpiarRed('tiktok', redes.tiktok),
    web: limpiarRed('web', redes.web),
  };
}

// Primer error encontrado, o null si todas las redes son válidas.
export function validarRedes(redes: RedesSociales): string | null {
  const mensajes: Record<Red, string> = {
    instagram: 'El usuario de Instagram no es válido.',
    facebook: 'El usuario de Facebook no es válido.',
    tiktok: 'El usuario de TikTok no es válido.',
    web: 'La web debe empezar con http:// o https://.',
  };
  const invalida = (Object.keys(PATRONES) as Red[]).find((red) => !esRedValida(red, redes[red]));
  return invalida ? mensajes[invalida] : null;
}

export function urlDeRed(red: Red, valor: string): string | null {
  const limpio = limpiarRed(red, valor);
  if (!limpio || !esRedValida(red, limpio)) return null;
  switch (red) {
    case 'instagram':
      return `https://instagram.com/${limpio}`;
    case 'facebook':
      return `https://facebook.com/${limpio}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${limpio}`;
    case 'web':
      return limpio;
  }
}
