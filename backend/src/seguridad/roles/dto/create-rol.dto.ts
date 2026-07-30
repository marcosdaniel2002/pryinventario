import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateRolDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;
}
