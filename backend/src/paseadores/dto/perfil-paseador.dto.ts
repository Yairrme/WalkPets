import { PartialType } from '@nestjs/swagger';
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
  ValidateNested,
} from 'class-validator';
import { EsFotoPerfil } from '../../common/foto-perfil';
import { Certificaciones, RedesSocialesDto } from '../../common/perfil-extra';
import { CIUDADES, Ciudad } from '../../constants/ciudades';

// Datos del perfil público de un paseador/cuidador.
export class PerfilPaseadorDto {
  @IsOptional()
  @EsFotoPerfil()
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

  @IsOptional()
  @ValidateNested()
  @Type(() => RedesSocialesDto)
  redes?: RedesSocialesDto;

  // Permisos y certificaciones declarados (ej. "Habilitación municipal").
  @Certificaciones()
  certificaciones?: string[];
}

// Edición del perfil propio desde el panel: todos los campos son opcionales y
// además se puede cambiar el teléfono de contacto.
export class ActualizarPerfilPaseadorDto extends PartialType(PerfilPaseadorDto) {
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;
}
