import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { CIUDADES, Ciudad } from '../../constants/ciudades';

const recortar = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Datos de la cuenta que el propio usuario puede cambiar. El correo, el rol y
// la contraseña no se editan desde acá.
export class ActualizarCuentaDto {
  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  nombre?: string;

  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  apellido?: string;

  // Vacío = quitar el teléfono (solo clientes; los paseadores lo necesitan).
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  // null = sin ciudad.
  @IsOptional()
  @ValidateIf((_, valor) => valor !== null)
  @IsIn(CIUDADES, { message: 'La ciudad debe ser Cipolletti o Neuquén.' })
  ciudad?: Ciudad | null;

  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MaxLength(80)
  barrio?: string;

  @IsOptional()
  @Transform(recortar)
  @IsString()
  @MaxLength(300)
  mascotas?: string;
}
