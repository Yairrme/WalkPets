import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsMongoId,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { aBooleano } from '../../paseadores/dto/paseadores.dto';
import { ROLES, Rol } from '../../usuarios/schemas/usuario.schema';

export class QueryUsuariosAdminDto {
  @IsOptional()
  @IsIn(ROLES, { message: 'El rol debe ser cliente, paseador o admin.' })
  rol?: Rol;

  // Busca en nombre, apellido y correo (sin distinguir mayúsculas).
  @IsOptional()
  @IsString()
  @MaxLength(80)
  q?: string;

  @IsOptional()
  @Transform(aBooleano)
  @IsBoolean({ message: 'activo debe ser true o false.' })
  activo?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;
}

export class CambiarEstadoUsuarioDto {
  @IsBoolean({ message: 'activo debe ser true o false.' })
  activo!: boolean;
}

export class QueryResenasAdminDto {
  @IsOptional()
  @IsMongoId({ message: 'paseadorId no es válido.' })
  paseadorId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pagina?: number;
}
