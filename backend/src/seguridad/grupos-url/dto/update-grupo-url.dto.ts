import { PartialType } from '@nestjs/mapped-types';
import { CreateGrupoUrlDto } from './create-grupo-url.dto';

export class UpdateGrupoUrlDto extends PartialType(CreateGrupoUrlDto) {}
