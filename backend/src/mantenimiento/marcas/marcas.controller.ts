import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { MarcasService } from './marcas.service';
import { CreateMarcaDto } from './dto/create-marca.dto';
import { UpdateMarcaDto } from './dto/update-marca.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { RequireUrl } from 'src/auth/require-url.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireUrl('mantenimiento', 'marcas')
@Controller('mantenimiento/marcas')
export class MarcasController {
  constructor(private readonly marcasService: MarcasService) {}

  private currentUserId(req: Request): string {
    return (req.user as { id: string }).id;
  }

  @Post()
  create(@Body() createMarcaDto: CreateMarcaDto, @Req() req: Request) {
    return this.marcasService.create(createMarcaDto, this.currentUserId(req));
  }

  @Get()
  findAll() {
    return this.marcasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.marcasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMarcaDto: UpdateMarcaDto,
    @Req() req: Request,
  ) {
    return this.marcasService.update(
      id,
      updateMarcaDto,
      this.currentUserId(req),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.marcasService.remove(id, this.currentUserId(req));
  }
}
