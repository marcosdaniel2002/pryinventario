import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty()
  codigo: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion: string;

  /**
   * @Type es necesario acá: el body llega como multipart/form-data (para
   * poder mandar la foto en el mismo request), y ahí todos los campos que
   * no son archivo llegan como string — sin esto, @IsNumber() rechazaría
   * "10.5" por no ser un number real.
   */
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  costo: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  porcentaje_iva: number;

  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  pvp: number;

  @IsString()
  @IsOptional()
  categoria_id: string;

  @IsString()
  @IsOptional()
  marca_id: string;
}
