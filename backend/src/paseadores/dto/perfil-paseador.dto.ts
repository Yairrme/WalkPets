import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { CIUDADES, Ciudad } from '../../constants/ciudades';

// Datos del perfil público de un paseador/cuidador.
export class PerfilPaseadorDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  fotoUrl?: string;

  @IsIn(CIUDADES, { message: 'La ciudad debe ser Cipolletti o Neuquén.' })
  ciudad!: Ciudad;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  barrio!: string;

  @IsString()
  @MinLength(15)
  @MaxLength(1000)
  descripcion!: string;

  @Type(() => Number)
  @Min(1)
  precioHora!: number;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  razasAceptadas?: string[];

  @IsOptional()
  @IsBoolean()
  disponible?: boolean;
}
