import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GruposUrlRepository } from './grupos-url.repository';
import { CreateGrupoUrlDto } from './dto/create-grupo-url.dto';
import { UpdateGrupoUrlDto } from './dto/update-grupo-url.dto';

@Injectable()
export class GruposUrlService {
  constructor(private readonly gruposUrlRepository: GruposUrlRepository) {}

  async create(createGrupoUrlDto: CreateGrupoUrlDto, usuarioActualId: string) {
    await this.ensurePathDisponible(createGrupoUrlDto.path);
    return this.gruposUrlRepository.create(createGrupoUrlDto, usuarioActualId);
  }

  /**
   * Sin page/limit devuelve el arreglo completo (lo consumen los combobox
   * de otras pantallas). Con page/limit devuelve `{ data, total, page,
   * limit }` para la tabla propia.
   */
  findAll(page?: number, limit?: number) {
    if (page === undefined && limit === undefined) {
      return this.gruposUrlRepository.findAll();
    }

    return this.findAllPaginated(page ?? 1, limit ?? 10);
  }

  private async findAllPaginated(page: number, limit: number) {
    const { data, total } = await this.gruposUrlRepository.findAllPaginated(
      page,
      limit,
    );
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const grupoUrl = await this.gruposUrlRepository.findOne(id);
    if (!grupoUrl) {
      throw new NotFoundException(`GrupoUrl con id ${id} no encontrado`);
    }
    return grupoUrl;
  }

  async update(
    id: string,
    updateGrupoUrlDto: UpdateGrupoUrlDto,
    usuarioActualId: string,
  ) {
    await this.findOne(id);
    if (updateGrupoUrlDto.path) {
      await this.ensurePathDisponible(updateGrupoUrlDto.path, id);
    }
    return this.gruposUrlRepository.update(
      id,
      updateGrupoUrlDto,
      usuarioActualId,
    );
  }

  async remove(id: string, usuarioActualId: string) {
    await this.findOne(id);
    return this.gruposUrlRepository.deactivate(id, usuarioActualId);
  }

  private async ensurePathDisponible(path: string, excludeId?: string) {
    const existente = await this.gruposUrlRepository.findActiveByPath(
      path,
      excludeId,
    );
    if (existente) {
      throw new ConflictException(
        `Ya existe un grupo de urls activo con el path "${path}"`,
      );
    }
  }
}
