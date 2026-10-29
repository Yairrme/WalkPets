// Foto de perfil del paseador. El campo `foto` admite tres formas:
//   - un ícono genérico: "avatar:mujer" o "avatar:hombre"
//   - una foto subida, guardada como data URI JPEG (data:image/jpeg;base64,...)
//   - una URL http(s) (perfiles viejos o cargados por seed)
// El backend valida las mismas reglas (ver PerfilPaseadorDto).

export const AVATARES = {
  mujer: 'avatar:mujer',
  hombre: 'avatar:hombre',
} as const;

export type TipoAvatar = keyof typeof AVATARES;

// Tamaño máximo de una foto subida (data URI). ~300 KB alcanzan de sobra
// para un JPEG de 400 px; el backend aplica el mismo límite.
export const MAX_FOTO_SUBIDA = 400_000;

export function tipoAvatar(foto: string | null | undefined): TipoAvatar | null {
  if (foto === AVATARES.mujer) return 'mujer';
  if (foto === AVATARES.hombre) return 'hombre';
  return null;
}

export function esFotoSubida(foto: string | null | undefined): boolean {
  return Boolean(foto && /^data:image\/(jpeg|png|webp);base64,/.test(foto));
}
