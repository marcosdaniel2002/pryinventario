import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { ProductosRepository, type ProductoFilters } from './productos.repository';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import {
  PRODUCTO_FOTO_FIELDS,
  type ProductoFotoField,
  type ProductoFotoFiles,
} from './producto-foto.config';

@Injectable()
export class ProductosService {
  constructor(private readonly productosRepository: ProductosRepository) {}

  async create(
    createProductoDto: CreateProductoDto,
    files: ProductoFotoFiles,
    usuarioActualId: string,
  ) {
    await this.ensureCodigoDisponible(createProductoDto.codigo);

    const fotoData: Partial<Record<string, string>> = {};
    for (const field of PRODUCTO_FOTO_FIELDS) {
      const file = files[field.name]?.[0];
      if (file) fotoData[field.name] = `${field.urlPrefix}/${file.filename}`;
    }

    return this.productosRepository.create(
      { ...createProductoDto, ...fotoData },
      usuarioActualId,
    );
  }

  /**
   * Sin page/limit devuelve el arreglo completo (lo consumen los combobox
   * de otras pantallas). Con page/limit devuelve `{ data, total, page,
   * limit }` para la tabla propia — `filters` (criterio/categoria_id/
   * marca_id) solo aplica en esta rama paginada.
   */
  findAll(page?: number, limit?: number, filters: ProductoFilters = {}) {
    if (page === undefined && limit === undefined) {
      return this.productosRepository.findAll();
    }

    return this.findAllPaginated(page ?? 1, limit ?? 10, filters);
  }

  private async findAllPaginated(
    page: number,
    limit: number,
    filters: ProductoFilters,
  ) {
    const { data, total } = await this.productosRepository.findAllPaginated(
      page,
      limit,
      filters,
    );
    return { data, total, page, limit };
  }

  async findOne(id: string) {
    const producto = await this.productosRepository.findOne(id);
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return producto;
  }

  async update(
    id: string,
    updateProductoDto: UpdateProductoDto,
    files: ProductoFotoFiles,
    usuarioActualId: string,
  ) {
    const producto = await this.ensureExists(id);

    if (updateProductoDto.codigo) {
      await this.ensureCodigoDisponible(updateProductoDto.codigo, id);
    }

    const { foto_eliminar, foto_2_eliminar, ...datosProducto } =
      updateProductoDto;
    const eliminarFlags: Record<string, boolean | undefined> = {
      foto: foto_eliminar,
      foto_2: foto_2_eliminar,
    };

    // undefined = no tocar esa foto; el resto de los casos sí la tocan.
    const fotoData: Partial<Record<string, string | null>> = {};
    for (const field of PRODUCTO_FOTO_FIELDS) {
      const file = files[field.name]?.[0];
      const valorActual = producto[field.name];

      if (file) {
        if (valorActual) await this.deleteFotoFile(field, valorActual);
        fotoData[field.name] = `${field.urlPrefix}/${file.filename}`;
      } else if (eliminarFlags[field.name] && valorActual) {
        await this.deleteFotoFile(field, valorActual);
        fotoData[field.name] = null;
      }
    }

    return this.productosRepository.update(
      id,
      { ...datosProducto, ...fotoData },
      usuarioActualId,
    );
  }

  async remove(id: string, usuarioActualId: string) {
    await this.ensureExists(id);
    const producto = await this.productosRepository.deactivate(
      id,
      usuarioActualId,
    );
    return producto;
  }

  /** Borra el archivo de disco correspondiente a una foto ya reemplazada o eliminada. */
  private async deleteFotoFile(field: ProductoFotoField, foto: string) {
    const filename = foto.replace(`${field.urlPrefix}/`, '');
    await unlink(join(field.destinationDir, filename)).catch(() => undefined);
  }

  private async ensureExists(id: string) {
    const producto = await this.productosRepository.findOne(id);
    if (!producto) {
      throw new NotFoundException(`Producto con id ${id} no encontrado`);
    }
    return producto;
  }

  private async ensureCodigoDisponible(codigo: string, excludeId?: string) {
    const productoExistente = await this.productosRepository.findByCodigo(
      codigo,
      excludeId,
    );
    if (productoExistente) {
      throw new ConflictException(`El código ${codigo} ya está en uso`);
    }
  }
}
