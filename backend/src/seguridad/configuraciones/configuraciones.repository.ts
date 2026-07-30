import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ConfiguracionesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Omit<Prisma.ConfiguracionUncheckedCreateInput, 'creado_por_id'>,
    usuarioActualId: string,
  ) {
    return this.prisma.configuracion.create({
      data: { ...data, creado_por_id: usuarioActualId },
    });
  }

  findAll() {
    return this.prisma.configuracion.findMany({
      where: { status: true },
    });
  }

  findOne(id: string) {
    return this.prisma.configuracion.findUnique({
      where: { id },
    });
  }

  update(
    id: string,
    data: Prisma.ConfiguracionUncheckedUpdateInput,
    usuarioActualId: string,
  ) {
    return this.prisma.configuracion.update({
      where: { id },
      data: { ...data, actualizado_por_id: usuarioActualId },
    });
  }

  /** Baja logica: desactiva el registro sin perder el historial. */
  deactivate(id: string, usuarioActualId: string) {
    return this.prisma.configuracion.update({
      where: { id },
      data: { status: false, actualizado_por_id: usuarioActualId },
    });
  }
}
