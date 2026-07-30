import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoriasRepository } from './categorias.repository';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly categoriasRepository: CategoriasRepository) {}

  create(createCategoriaDto: CreateCategoriaDto, usuarioActualId: string) {
    return this.categoriasRepository.create(
      createCategoriaDto,
      usuarioActualId,
    );
  }

  /**
   * Sin page/limit devuelve el arreglo completo (lo consumen los combobox
   * de otras pantallas, ej. selector de categoría en Productos). Con
   * page/limit devuelve `{ data, total, page, limit }` para la tabla propia.
   */
  findAll(page?: number, limit?: number) {
    if (page === undefined && limit === undefined) {
      return this.categoriasRepository.findAll();
    }

    return this.findAllPaginated(page ?? 1, limit ?? 10);
  }

  private async findAllPaginated(page: number, limit: number) {
    const { data, total } = await this.categoriasRepository.findAllPaginated(
      page,
      limit,
    );
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const categoria = await this.categoriasRepository.findOne(id);
    if (!categoria) {
      throw new NotFoundException(`Categoria con id ${id} no encontrado`);
    }
    return categoria;
  }

  async update(
    id: string,
    updateCategoriaDto: UpdateCategoriaDto,
    usuarioActualId: string,
  ) {
    await this.findOne(id);
    return this.categoriasRepository.update(
      id,
      updateCategoriaDto,
      usuarioActualId,
    );
  }

  async remove(id: string, usuarioActualId: string) {
    await this.findOne(id);
    return this.categoriasRepository.deactivate(id, usuarioActualId);
  }
}
