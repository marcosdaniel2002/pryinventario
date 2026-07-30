import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MarcasRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Omit<Prisma.MarcaUncheckedCreateInput, 'creado_por_id'>,
    usuarioActualId: string,
  ) {
    return this.prisma.marca.create({
      data: { ...data, creado_por_id: usuarioActualId },
    });
  }

  findAll() {
    return this.prisma.marca.findMany({
      where: { status: true },
    });
  }

  findOne(id: string) {
    return this.prisma.marca.findUnique({
      where: { id },
    });
  }

  update(
    id: string,
    data: Prisma.MarcaUncheckedUpdateInput,
    usuarioActualId: string,
  ) {
    return this.prisma.marca.update({
      where: { id },
      data: { ...data, actualizado_por_id: usuarioActualId },
    });
  }

  /** Baja logica: desactiva el registro sin perder el historial. */
  deactivate(id: string, usuarioActualId: string) {
    return this.prisma.marca.update({
      where: { id },
      data: { status: false, actualizado_por_id: usuarioActualId },
    });
  }
}
