import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUrlDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsOptional()
  icono?: string;

  /**
   * @Type es necesario acá: el body llega como multipart/form-data (ver
   * EntityDialog), y ahí todos los campos que no son archivo llegan como
   * string — sin esto, @IsInt() rechazaría "3" por no ser un number real.
   */
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  orden?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsString()
  @IsNotEmpty()
  grupo_url_id: string;
}
