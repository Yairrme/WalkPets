import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

// Datos opcionales del perfil público de un paseador: redes sociales y
// permisos/certificaciones. Son declarados por el paseador: WalkPets no los
// verifica, y así se muestra en la app.

// Usuarios de redes: se guardan sin "@" y sin espacios.
const limpiarUsuario = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().replace(/^@+/, '') : value;

const recortar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Vacío = sin esa red.
const USUARIO_RED = /^$|^[A-Za-z0-9._]{1,30}$/;
const USUARIO_FACEBOOK = /^$|^[A-Za-z0-9.]{1,50}$/;
const URL_WEB = /^$|^https?:\/\/[^\s]+$/;

export class RedesSocialesDto {
  @IsOptional()
  @Transform(limpiarUsuario)
  @IsString()
  @Matches(USUARIO_RED, { message: 'El usuario de Instagram no es válido.' })
  instagram?: string;

  @IsOptional()
  @Transform(limpiarUsuario)
  @IsString()
  @Matches(USUARIO_FACEBOOK, { message: 'El usuario de Facebook no es válido.' })
  facebook?: string;

  @IsOptional()
  @Transform(limpiarUsuario)
  @IsString()
  @Matches(USUARIO_RED, { message: 'El usuario de TikTok no es válido.' })
  tiktok?: string;

  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MaxLength(200)
  @Matches(URL_WEB, { message: 'La web debe empezar con http:// o https://.' })
  web?: string;
}

export const MAX_CERTIFICACIONES = 8;

// Decoradores de la lista de permisos y certificaciones.
export function Certificaciones(): PropertyDecorator {
  return (objetivo, propiedad) => {
    for (const decorador of [
      IsOptional(),
      Transform(({ value }: { value: unknown }) =>
        Array.isArray(value)
          ? [...new Set(value.map((v) => (typeof v === 'string' ? v.trim() : v)))].filter(Boolean)
          : value
      ),
      IsArray(),
      ArrayMaxSize(MAX_CERTIFICACIONES),
      IsString({ each: true }),
      MinLength(3, { each: true }),
      MaxLength(80, { each: true }),
    ]) {
      decorador(objetivo, propiedad);
    }
  };
}

export type RedesSociales = {
  instagram: string;
  facebook: string;
  tiktok: string;
  web: string;
};

export const REDES_VACIAS: RedesSociales = { instagram: '', facebook: '', tiktok: '', web: '' };
