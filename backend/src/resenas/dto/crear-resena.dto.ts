import { Type } from 'class-transformer';
import {
  IsInt,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CrearResenaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  mascota!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  texto!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  calificacion!: number;
}
