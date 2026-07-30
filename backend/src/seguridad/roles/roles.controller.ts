import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { RolesService } from './roles.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { AssignRolUrlsDto } from './dto/assign-rol-urls.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequireUrl } from '../../auth/require-url.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireUrl('seguridad', 'roles')
// El frontend manda multipart/form-data por default (ver EntityDialog),
// tenga o no archivos la entidad. NoFilesInterceptor parsea esos campos a
// @Body() sin esperar ningún archivo — a nivel de controller porque ninguna
// ruta de acá tiene campos de archivo (si algún día los tiene, ese método
// pasa a FileFieldsInterceptor propio, como ProductosController). También
// cubre PUT :id/urls, que manda el array url_ids por el mismo mecanismo.
@UseInterceptors(NoFilesInterceptor())
@Controller('seguridad/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  private currentUserId(req: Request): string {
    return (req.user as { id: string }).id;
  }

  @Post()
  create(@Body() createRolDto: CreateRolDto, @Req() req: Request) {
    return this.rolesService.create(createRolDto, this.currentUserId(req));
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.rolesService.findAll(query.page, query.limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRolDto: UpdateRolDto,
    @Req() req: Request,
  ) {
    return this.rolesService.update(id, updateRolDto, this.currentUserId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.rolesService.remove(id, this.currentUserId(req));
  }

  @Get(':id/urls')
  async getUrls(@Param('id') id: string) {
    const url_ids = await this.rolesService.getAssignedUrls(id);
    return { url_ids };
  }

  @Put(':id/urls')
  async setUrls(
    @Param('id') id: string,
    @Body() assignRolUrlsDto: AssignRolUrlsDto,
    @Req() req: Request,
  ) {
    const url_ids = await this.rolesService.setAssignedUrls(
      id,
      assignRolUrlsDto.url_ids,
      this.currentUserId(req),
    );
    return { url_ids };
  }
}
