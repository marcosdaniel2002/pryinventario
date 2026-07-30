import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateConfiguracionDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsString()
  @IsOptional()
  celular?: string;

  @IsEmail()
  @IsOptional()
  correo?: string;
}
