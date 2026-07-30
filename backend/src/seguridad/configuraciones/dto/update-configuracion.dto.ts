import { PartialType } from '@nestjs/mapped-types';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateConfiguracionDto } from './create-configuracion.dto';

export class UpdateConfiguracionDto extends PartialType(CreateConfiguracionDto) {
  /**
   * "true" (string, viene de un campo de FormData) para sacar el icono
   * actual sin subir uno nuevo. Se ignora si además viene un archivo nuevo.
   */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  icono_eliminar?: boolean;
}
