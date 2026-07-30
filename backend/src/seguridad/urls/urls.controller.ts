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
import { UrlsService } from './urls.service';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/permissions.guard';
import { RequireUrl } from '../../auth/require-url.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireUrl('seguridad', 'urls')
// El frontend manda multipart/form-data por default (ver EntityDialog),
// tenga o no archivos la entidad. NoFilesInterceptor parsea esos campos a
// @Body() sin esperar ningún archivo — a nivel de controller porque ninguna
// ruta de acá tiene campos de archivo (si algún día los tiene, ese método
// pasa a FileFieldsInterceptor propio, como ProductosController).
@UseInterceptors(NoFilesInterceptor())
@Controller('seguridad/urls')
export class UrlsController {
  constructor(private readonly urlsService: UrlsService) {}

  private currentUserId(req: Request): string {
    return (req.user as { id: string }).id;
  }

  @Post()
  create(@Body() createUrlDto: CreateUrlDto, @Req() req: Request) {
    return this.urlsService.create(createUrlDto, this.currentUserId(req));
  }

  @Get()
  findAll(@Query() query: PaginationQueryDto) {
    return this.urlsService.findAll(query.page, query.limit);
  }

  @Get('menu/:rolId')
  getMenu(@Param('rolId') rolId: string) {
    return this.urlsService.getMenu(rolId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.urlsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUrlDto: UpdateUrlDto,
    @Req() req: Request,
  ) {
    return this.urlsService.update(id, updateUrlDto, this.currentUserId(req));
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.urlsService.remove(id, this.currentUserId(req));
  }
}
