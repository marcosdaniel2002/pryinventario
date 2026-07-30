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
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequireUrl } from '../../auth/require-url.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireUrl('seguridad', 'usuarios')
// El frontend manda multipart/form-data por default (ver EntityDialog),
// tenga o no archivos la entidad. NoFilesInterceptor parsea esos campos a
// @Body() sin esperar ningún archivo — a nivel de controller porque ninguna
// ruta de acá tiene campos de archivo (si algún día los tiene, ese método
// pasa a FileFieldsInterceptor propio, como ProductosController).
@UseInterceptors(NoFilesInterceptor())
@Controller('seguridad/usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  private currentUserId(req: Request): string {
    return (req.user as { id: string }).id;
  }

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto, @Req() req: Request) {
    return this.usuariosService.create(
      createUsuarioDto,
      this.currentUserId(req),
    );
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.usuariosService.findAll(query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Req() req: Request,
  ) {
    return this.usuariosService.update(
      id,
      updateUsuarioDto,
      this.currentUserId(req),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.usuariosService.remove(id, this.currentUserId(req));
  }
}
