import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { CIUDADES, Ciudad } from '../../constants/ciudades';

// Convierte el texto de la query string en booleano real. `Boolean('false')`
// daría `true`, así que no alcanza con @Type(() => Boolean).
const aBooleano = ({ value }: { value: unknown }) => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return value;
};

export class QueryPaseadoresDto {
  @IsOptional()
  @IsIn(CIUDADES, { message: 'La ciudad debe ser Cipolletti o Neuquén.' })
  ciudad?: Ciudad;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  barrio?: string;

  @IsOptional()
  @Transform(aBooleano)
  @IsBoolean({ message: 'disponible debe ser true o false.' })
  disponible?: boolean;
}
