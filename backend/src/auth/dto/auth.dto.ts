import { Type } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { PerfilPaseadorDto } from '../../paseadores/dto/perfil-paseador.dto';

export class RegistroDto {
  @IsString()
  @MinLength(2)
  @MaxLength(60)
  nombre!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  apellido!: string;

  @IsEmail({}, { message: 'Ingresá un correo electrónico válido.' })
  @MaxLength(120)
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  // Obligatorio para paseadores; opcional para clientes.
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @IsIn(['cliente', 'paseador'], {
    message: 'El rol debe ser cliente o paseador.',
  })
  rol!: 'cliente' | 'paseador';

  @IsOptional()
  @ValidateNested()
  @Type(() => PerfilPaseadorDto)
  paseador?: PerfilPaseadorDto;
}

export class LoginDto {
  @IsString()
  @MaxLength(120)
  email!: string;

  @IsString()
  @MaxLength(72)
  password!: string;
}
