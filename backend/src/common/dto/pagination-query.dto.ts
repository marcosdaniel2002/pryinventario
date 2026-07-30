import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/**
 * page/limit quedan undefined si no vienen en el query string: eso es lo
 * que le permite a cada findAll() distinguir "traeme todo" (usado por los
 * combobox de otras pantallas) de "traeme paginado" (usado por la tabla).
 * Por eso no llevan valor default acá — el default se resuelve en el
 * service, solo cuando ya se sabe que se pidió paginación.
 */
export class PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
