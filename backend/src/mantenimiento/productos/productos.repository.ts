import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

export interface ProductoFilters {
  criterio?: string;
  categoria_id?: string;
  marca_id?: string;
}

@Injectable()
export class ProductosRepository {
  constructor(private readonly prisma: PrismaService) {}

  private buildWhere(filters: ProductoFilters): Prisma.ProductoWhereInput {
    return {
      status: true,
      ...(filters.categoria_id ? { categoria_id: filters.categoria_id } : {}),
      ...(filters.marca_id ? { marca_id: filters.marca_id } : {}),
      ...(filters.criterio
        ? {
            OR: [
              { codigo: { contains: filters.criterio, mode: 'insensitive' } },
              { nombre: { contains: filters.criterio, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }

  create(
    data: Omit<Prisma.ProductoUncheckedCreateInput, 'creado_por_id'>,
    usuarioActualId: string,
  ) {
    return this.prisma.producto.create({
      data: { ...data, creado_por_id: usuarioActualId },
    });
  }

  findAll() {
    return this.prisma.producto.findMany({
      where: { status: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    filters: ProductoFilters = {},
  ) {
    const where = this.buildWhere(filters);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.producto.findMany({
        where,
        orderBy: { nombre: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.producto.count({ where }),
    ]);
    return { data, total };
  }

  findOne(id: string) {
    return this.prisma.producto.findUnique({
      where: { id },
    });
  }

  findByCodigo(codigo: string, excludeId?: string) {
    return this.prisma.producto.findFirst({
      where: {
        codigo,
        status: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  update(
    id: string,
    data: Prisma.ProductoUncheckedUpdateInput,
    usuarioActualId: string,
  ) {
    return this.prisma.producto.update({
      where: { id },
      data: { ...data, actualizado_por_id: usuarioActualId },
    });
  }

  /** Baja lógica: desactiva el producto sin perder el historial. */
  deactivate(id: string, usuarioActualId: string) {
    return this.prisma.producto.update({
      where: { id },
      data: { status: false, actualizado_por_id: usuarioActualId },
    });
  }
}
