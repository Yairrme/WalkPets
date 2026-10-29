import { ValidateBy, ValidationOptions } from 'class-validator';

// Formas válidas de `fotoUrl` (el frontend aplica las mismas reglas):
//   - ícono genérico: "avatar:mujer" | "avatar:hombre"
//   - foto subida: data URI de imagen JPEG/PNG/WebP, hasta MAX_FOTO_SUBIDA
//   - URL http(s) de hasta 500 caracteres
//   - vacío (sin foto)

export const AVATARES = ['avatar:mujer', 'avatar:hombre'] as const;
export const MAX_FOTO_SUBIDA = 400_000;
const MAX_URL = 500;

export function esFotoPerfilValida(valor: unknown): boolean {
  if (typeof valor !== 'string') return false;
  if (valor === '') return true;
  if ((AVATARES as readonly string[]).includes(valor)) return true;
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/.test(valor)) {
    return valor.length <= MAX_FOTO_SUBIDA;
  }
  return /^https?:\/\/\S+$/.test(valor) && valor.length <= MAX_URL;
}

export function EsFotoPerfil(opciones?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'esFotoPerfil',
      validator: {
        validate: esFotoPerfilValida,
        defaultMessage: () =>
          'La foto debe ser un avatar, una imagen subida de hasta 300 KB o una URL válida.',
      },
    },
    opciones
  );
}
