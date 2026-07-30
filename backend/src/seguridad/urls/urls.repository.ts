import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UrlsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Omit<Prisma.UrlUncheckedCreateInput, 'creado_por_id'>,
    usuarioActualId: string,
  ) {
    return this.prisma.url.create({
      data: { ...data, creado_por_id: usuarioActualId },
    });
  }

  findAll() {
    return this.prisma.url.findMany({
      where: { status: true },
      orderBy: { orden: 'asc' },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.url.findMany({
        where: { status: true },
        orderBy: { orden: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.url.count({ where: { status: true } }),
    ]);
    return { data, total };
  }

  findOne(id: string) {
    return this.prisma.url.findUnique({
      where: { id },
    });
  }

  /**
   * Busca una url activa con el mismo path dentro del mismo grupo,
   * excluyendo su propio id (para updates). El mismo path sí puede
   * repetirse en otro grupo_url_id.
   */
  findActiveByGrupoAndPath(grupoUrlId: string, path: string, excludeId?: string) {
    return this.prisma.url.findFirst({
      where: {
        grupo_url_id: grupoUrlId,
        path,
        status: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  update(
    id: string,
    data: Prisma.UrlUncheckedUpdateInput,
    usuarioActualId: string,
  ) {
    return this.prisma.url.update({
      where: { id },
      data: { ...data, actualizado_por_id: usuarioActualId },
    });
  }

  /** Baja lógica: desactiva la url sin perder el historial. */
  deactivate(id: string, usuarioActualId: string) {
    return this.prisma.url.update({
      where: { id },
      data: { status: false, actualizado_por_id: usuarioActualId },
    });
  }

  /**
   * Devuelve los GrupoUrl (con sus Urls hijas) permitidos para un rol,
   * a través de la tabla intermedia RolUrl. Sirve para armar el menú
   * del frontend luego del login.
   */
  findMenuByRol(rolId: string) {
    return this.prisma.grupoUrl.findMany({
      where: {
        status: true,
        urls: {
          some: {
            status: true,
            rol_urls: { some: { rol_id: rolId } },
          },
        },
      },
      orderBy: { orden: 'asc' },
      include: {
        urls: {
          where: {
            status: true,
            rol_urls: { some: { rol_id: rolId } },
          },
          orderBy: { orden: 'asc' },
        },
      },
    });
  }
}
