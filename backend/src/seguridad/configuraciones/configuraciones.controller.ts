import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';

import { ConfiguracionesService } from './configuraciones.service';
import { CreateConfiguracionDto } from './dto/create-configuracion.dto';
import { UpdateConfiguracionDto } from './dto/update-configuracion.dto';
import {
  assertUploadedFilesWithinLimits,
  createImageUploadOptions,
} from 'src/common/upload/image-upload.factory';
import { CONFIGURACION_ICONO_FIELD } from './configuracion-icono.config';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { RequireUrl } from 'src/auth/require-url.decorator';

const iconoUploadOptions = createImageUploadOptions([CONFIGURACION_ICONO_FIELD]);

/**
 * findAll/findOne quedan sin @UseGuards a propósito: nombre/ícono/descripción/
 * contacto son datos públicos del sitio (los consume tanto la landing page
 * pública como el navbar del admin, vía ConfiguracionProvider) — ver
 * AuthController.login para el mismo patrón de endpoint sin guard en este
 * proyecto. Crear/editar sigue exigiendo permiso, método por método.
 */
@Controller('seguridad/configuraciones')
export class ConfiguracionesController {
  constructor(private readonly configuracionesService: ConfiguracionesService) {}

  private currentUserId(req: Request): string {
    return (req.user as { id: string }).id;
  }

  private async validatedFile(file: Express.Multer.File | undefined) {
    if (file) {
      await assertUploadedFilesWithinLimits([file], [CONFIGURACION_ICONO_FIELD]);
    }
    return file;
  }

  @Post()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireUrl('seguridad', 'configuraciones')
  @UseInterceptors(FileInterceptor('icono', iconoUploadOptions))
  async create(
    @Body() createConfiguracionDto: CreateConfiguracionDto,
    @UploadedFile() icono: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    return this.configuracionesService.create(
      createConfiguracionDto,
      await this.validatedFile(icono),
      this.currentUserId(req),
    );
  }

  @Get()
  findAll() {
    return this.configuracionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.configuracionesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireUrl('seguridad', 'configuraciones')
  @UseInterceptors(FileInterceptor('icono', iconoUploadOptions))
  async update(
    @Param('id') id: string,
    @Body() updateConfiguracionDto: UpdateConfiguracionDto,
    @UploadedFile() icono: Express.Multer.File | undefined,
    @Req() req: Request,
  ) {
    return this.configuracionesService.update(
      id,
      updateConfiguracionDto,
      await this.validatedFile(icono),
      this.currentUserId(req),
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequireUrl('seguridad', 'configuraciones')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.configuracionesService.remove(id, this.currentUserId(req));
  }
}
