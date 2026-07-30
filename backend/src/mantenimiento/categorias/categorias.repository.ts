import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriasRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Omit<Prisma.CategoriaUncheckedCreateInput, 'creado_por_id'>,
    usuarioActualId: string,
  ) {
    return this.prisma.categoria.create({
      data: { ...data, creado_por_id: usuarioActualId },
    });
  }

  findAll() {
    return this.prisma.categoria.findMany({
      where: { status: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.categoria.findMany({
        where: { status: true },
        orderBy: { nombre: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.categoria.count({ where: { status: true } }),
    ]);
    return { data, total };
  }

  findOne(id: string) {
    return this.prisma.categoria.findUnique({
      where: { id },
    });
  }

  update(
    id: string,
    data: Prisma.CategoriaUncheckedUpdateInput,
    usuarioActualId: string,
  ) {
    return this.prisma.categoria.update({
      where: { id },
      data: { ...data, actualizado_por_id: usuarioActualId },
    });
  }

  /** Baja logica: desactiva el registro sin perder el historial. */
  deactivate(id: string, usuarioActualId: string) {
    return this.prisma.categoria.update({
      where: { id },
      data: { status: false, actualizado_por_id: usuarioActualId },
    });
  }
}
