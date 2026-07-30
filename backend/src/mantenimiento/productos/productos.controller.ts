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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { ProductosQueryDto } from './dto/productos-query.dto';
import {
  assertUploadedFilesWithinLimits,
  createImageUploadOptions,
} from 'src/common/upload/image-upload.factory';
import {
  PRODUCTO_FOTO_FIELDS,
  type ProductoFotoFiles,
} from './producto-foto.config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { RequireUrl } from 'src/auth/require-url.decorator';

const fotoInterceptorFields = PRODUCTO_FOTO_FIELDS.map((field) => ({
  name: field.name,
  maxCount: 1,
}));
const fotoUploadOptions = createImageUploadOptions(PRODUCTO_FOTO_FIELDS);

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireUrl('mantenimiento', 'productos')
@Controller('mantenimiento/productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  private currentUserId(req: Request): string {
    return (req.user as { id: string }).id;
  }

  private async validatedFiles(files: ProductoFotoFiles) {
    const allFiles = Object.values(files).flatMap((f) => f ?? []);
    await assertUploadedFilesWithinLimits(allFiles, PRODUCTO_FOTO_FIELDS);
    return files;
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(fotoInterceptorFields, fotoUploadOptions),
  )
  async create(
    @Body() createProductoDto: CreateProductoDto,
    @UploadedFiles() files: ProductoFotoFiles,
    @Req() req: Request,
  ) {
    return this.productosService.create(
      createProductoDto,
      await this.validatedFiles(files),
      this.currentUserId(req),
    );
  }

  @Get()
  findAll(@Query() query: ProductosQueryDto) {
    return this.productosService.findAll(query.page, query.limit, {
      criterio: query.criterio,
      categoria_id: query.categoria_id,
      marca_id: query.marca_id,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productosService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor(fotoInterceptorFields, fotoUploadOptions),
  )
  async update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
    @UploadedFiles() files: ProductoFotoFiles,
    @Req() req: Request,
  ) {
    return this.productosService.update(
      id,
      updateProductoDto,
      await this.validatedFiles(files),
      this.currentUserId(req),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.productosService.remove(id, this.currentUserId(req));
  }
}
