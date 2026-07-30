import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateProductoDto } from './create-producto.dto';

export class UpdateProductoDto extends PartialType(CreateProductoDto) {
  /**
   * "true" (string, viene de un campo de FormData) para sacar la foto
   * actual sin subir una nueva. Se ignora si además viene un archivo nuevo
   * para ese mismo campo. Nombre en sufijo (`<campo>_eliminar`) porque es
   * el default que arma EntityDialog en el frontend.
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  foto_eliminar?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  foto_2_eliminar?: boolean;
}
