import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { GruposUrlService } from './grupos-url.service';
import { CreateGrupoUrlDto } from './dto/create-grupo-url.dto';
import { UpdateGrupoUrlDto } from './dto/update-grupo-url.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequireUrl } from '../../auth/require-url.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireUrl('seguridad', 'grupos-url')
// El frontend manda multipart/form-data por default (ver EntityDialog),
// tenga o no archivos la entidad. NoFilesInterceptor parsea esos campos a
// @Body() sin esperar ningún archivo — a nivel de controller porque ninguna
// ruta de acá tiene campos de archivo (si algún día los tiene, ese método
// pasa a FileFieldsInterceptor propio, como ProductosController).
@UseInterceptors(NoFilesInterceptor())
@Controller('seguridad/grupos-url')
export class GruposUrlController {
  constructor(private readonly gruposUrlService: GruposUrlService) {}

  private currentUserId(req: Request): string {
    return (req.user as { id: string }).id;
  }

  @Post()
  create(@Body() createGrupoUrlDto: CreateGrupoUrlDto, @Req() req: Request) {
    return this.gruposUrlService.create(
      createGrupoUrlDto,
      this.currentUserId(req),
    );
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.gruposUrlService.findAll(query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gruposUrlService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGrupoUrlDto: UpdateGrupoUrlDto,
    @Req() req: Request,
  ) {
    return this.gruposUrlService.update(
      id,
      updateGrupoUrlDto,
      this.currentUserId(req),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.gruposUrlService.remove(id, this.currentUserId(req));
  }
}
