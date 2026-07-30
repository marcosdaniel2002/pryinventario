import { Transform } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class AssignRolUrlsDto {
  /**
   * El body llega como multipart/form-data (ver EntityDialog en el
   * frontend), donde un array va como un único campo con el JSON adentro
   * — acá se parsea de vuelta antes de validar.
   */
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @IsArray()
  @IsString({ each: true })
  url_ids: string[];
}
