import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsuariosRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.UsuarioUncheckedCreateInput, usuarioActualId: string) {
    return this.prisma.usuario.create({
      data: { ...data, creado_por_id: usuarioActualId },
      include: { rol: true },
    });
  }

  findAll() {
    return this.prisma.usuario.findMany({
      where: { status: true },
      include: { rol: true },
      orderBy: { username: 'asc' },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.usuario.findMany({
        where: { status: true },
        include: { rol: true },
        orderBy: { username: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.usuario.count({ where: { status: true } }),
    ]);
    return { data, total };
  }

  findOne(id: string) {
    return this.prisma.usuario.findUnique({
      where: { id },
      include: { rol: true },
    });
  }

  findByUsername(username: string) {
    return this.prisma.usuario.findFirst({
      where: { username, status: true },
      include: { rol: true },
    });
  }

  /** Busca un usuario activo con el mismo username, excluyendo su propio id (para updates). */
  findActiveByUsername(username: string, excludeId?: string) {
    return this.prisma.usuario.findFirst({
      where: {
        username,
        status: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  /** Busca un usuario activo con el mismo email, excluyendo su propio id (para updates). */
  findActiveByEmail(email: string, excludeId?: string) {
    return this.prisma.usuario.findFirst({
      where: {
        email,
        status: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  update(
    id: string,
    data: Prisma.UsuarioUncheckedUpdateInput,
    usuarioActualId: string,
  ) {
    return this.prisma.usuario.update({
      where: { id },
      data: { ...data, actualizado_por_id: usuarioActualId },
      include: { rol: true },
    });
  }

  /** Baja lógica: desactiva el usuario sin perder el historial. */
  deactivate(id: string, usuarioActualId: string) {
    return this.prisma.usuario.update({
      where: { id },
      data: { status: false, actualizado_por_id: usuarioActualId },
      include: { rol: true },
    });
  }
}
