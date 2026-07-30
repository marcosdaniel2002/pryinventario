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

import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { RequireUrl } from 'src/auth/require-url.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireUrl('mantenimiento', 'categorias')
// El frontend manda multipart/form-data por default (ver EntityDialog),
// tenga o no archivos la entidad. NoFilesInterceptor parsea esos campos a
// @Body() sin esperar ningún archivo — a nivel de controller porque ninguna
// ruta de acá tiene campos de archivo (si algún día los tiene, ese método
// pasa a FileFieldsInterceptor propio, como ProductosController).
@UseInterceptors(NoFilesInterceptor())
@Controller('mantenimiento/categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  private currentUserId(req: Request): string {
    return (req.user as { id: string }).id;
  }

  @Post()
  create(@Body() createCategoriaDto: CreateCategoriaDto, @Req() req: Request) {
    return this.categoriasService.create(
      createCategoriaDto,
      this.currentUserId(req),
    );
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.categoriasService.findAll(query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoriaDto: UpdateCategoriaDto,
    @Req() req: Request,
  ) {
    return this.categoriasService.update(
      id,
      updateCategoriaDto,
      this.currentUserId(req),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.categoriasService.remove(id, this.currentUserId(req));
  }
}
