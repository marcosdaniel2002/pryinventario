import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

export class ProductosQueryDto extends PaginationQueryDto {
  /** Busca por código o nombre (case-insensitive, "contains"). */
  @IsOptional()
  @IsString()
  criterio?: string;

  @IsOptional()
  @IsString()
  categoria_id?: string;

  @IsOptional()
  @IsString()
  marca_id?: string;
}
