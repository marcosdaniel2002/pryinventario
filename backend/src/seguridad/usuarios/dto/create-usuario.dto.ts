import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @MinLength(4)
  password: string;

  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsString()
  @IsNotEmpty()
  rol_id: string;
}
