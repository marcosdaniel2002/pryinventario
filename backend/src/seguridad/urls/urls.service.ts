import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UrlsRepository } from './urls.repository';
import { CreateUrlDto } from './dto/create-url.dto';
import { UpdateUrlDto } from './dto/update-url.dto';

@Injectable()
export class UrlsService {
  constructor(private readonly urlsRepository: UrlsRepository) {}

  async create(createUrlDto: CreateUrlDto, usuarioActualId: string) {
    await this.ensurePathDisponibleEnGrupo(
      createUrlDto.grupo_url_id,
      createUrlDto.path,
    );

    return this.urlsRepository.create(createUrlDto, usuarioActualId);
  }

  /**
   * Sin page/limit devuelve el arreglo completo (lo consumen los combobox
   * de otras pantallas). Con page/limit devuelve `{ data, total, page,
   * limit }` para la tabla propia.
   */
  findAll(page?: number, limit?: number) {
    if (page === undefined && limit === undefined) {
      return this.urlsRepository.findAll();
    }

    return this.findAllPaginated(page ?? 1, limit ?? 10);
  }

  private async findAllPaginated(page: number, limit: number) {
    const { data, total } = await this.urlsRepository.findAllPaginated(
      page,
      limit,
    );
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const url = await this.urlsRepository.findOne(id);
    if (!url) {
      throw new NotFoundException(`Url con id ${id} no encontrada`);
    }
    return url;
  }

  async update(
    id: string,
    updateUrlDto: UpdateUrlDto,
    usuarioActualId: string,
  ) {
    const urlActual = await this.ensureExists(id);

    if (updateUrlDto.grupo_url_id || updateUrlDto.path) {
      await this.ensurePathDisponibleEnGrupo(
        updateUrlDto.grupo_url_id ?? urlActual.grupo_url_id,
        updateUrlDto.path ?? urlActual.path,
        id,
      );
    }

    return this.urlsRepository.update(id, updateUrlDto, usuarioActualId);
  }

  async remove(id: string, usuarioActualId: string) {
    await this.ensureExists(id);
    return this.urlsRepository.deactivate(id, usuarioActualId);
  }

  getMenu(rolId: string) {
    return this.urlsRepository.findMenuByRol(rolId);
  }

  private async ensureExists(id: string) {
    const url = await this.urlsRepository.findOne(id);
    if (!url) {
      throw new NotFoundException(`Url con id ${id} no encontrada`);
    }
    return url;
  }

  private async ensurePathDisponibleEnGrupo(
    grupoUrlId: string,
    path: string,
    excludeId?: string,
  ) {
    const existente = await this.urlsRepository.findActiveByGrupoAndPath(
      grupoUrlId,
      path,
      excludeId,
    );
    if (existente) {
      throw new ConflictException(
        `Ya existe una url activa con el path "${path}" en ese grupo`,
      );
    }
  }
}
