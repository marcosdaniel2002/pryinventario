import { IsNotEmpty, IsString } from 'class-validator';

// TODO: ajustar los campos segun el modelo Categoria en prisma/schema.prisma
export class CreateCategoriaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
