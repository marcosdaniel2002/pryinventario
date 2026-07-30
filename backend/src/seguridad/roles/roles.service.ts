import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RolesRepository } from './roles.repository';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesService {
  constructor(private readonly rolesRepository: RolesRepository) {}

  async create(createRolDto: CreateRolDto, usuarioActualId: string) {
    await this.ensureNombreDisponible(createRolDto.nombre);
    return this.rolesRepository.create(createRolDto, usuarioActualId);
  }

  /**
   * Sin page/limit devuelve el arreglo completo (lo consumen los combobox
   * de otras pantallas). Con page/limit devuelve `{ data, total, page,
   * limit }` para la tabla propia.
   */
  findAll(page?: number, limit?: number) {
    if (page === undefined && limit === undefined) {
      return this.rolesRepository.findAll();
    }

    return this.findAllPaginated(page ?? 1, limit ?? 10);
  }

  private async findAllPaginated(page: number, limit: number) {
    const { data, total } = await this.rolesRepository.findAllPaginated(
      page,
      limit,
    );
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const rol = await this.rolesRepository.findOne(id);
    if (!rol) {
      throw new NotFoundException(`Rol con id ${id} no encontrado`);
    }
    return rol;
  }

  async update(id: string, updateRolDto: UpdateRolDto, usuarioActualId: string) {
    await this.findOne(id);
    if (updateRolDto.nombre) {
      await this.ensureNombreDisponible(updateRolDto.nombre, id);
    }
    return this.rolesRepository.update(id, updateRolDto, usuarioActualId);
  }

  async remove(id: string, usuarioActualId: string) {
    await this.findOne(id);
    return this.rolesRepository.deactivate(id, usuarioActualId);
  }

  async getAssignedUrls(id: string) {
    await this.findOne(id);
    return this.rolesRepository.getUrlIds(id);
  }

  async setAssignedUrls(
    id: string,
    urlIds: string[],
    usuarioActualId: string,
  ) {
    await this.findOne(id);
    await this.rolesRepository.setUrls(id, urlIds, usuarioActualId);
    return this.rolesRepository.getUrlIds(id);
  }

  private async ensureNombreDisponible(nombre: string, excludeId?: string) {
    const existente = await this.rolesRepository.findActiveByNombre(
      nombre,
      excludeId,
    );
    if (existente) {
      throw new ConflictException(
        `Ya existe un rol activo con el nombre "${nombre}"`,
      );
    }
  }
}
