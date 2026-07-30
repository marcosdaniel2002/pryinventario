import { IsNotEmpty, IsString } from 'class-validator';

// TODO: ajustar los campos segun el modelo Marca en prisma/schema.prisma
export class CreateMarcaDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
