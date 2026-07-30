import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';

@Injectable()
export class RolesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateRolDto, usuarioActualId: string) {
    return this.prisma.rol.create({
      data: { ...data, creado_por_id: usuarioActualId },
    });
  }

  findAll() {
    return this.prisma.rol.findMany({
      where: { status: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.rol.findMany({
        where: { status: true },
        orderBy: { nombre: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.rol.count({ where: { status: true } }),
    ]);
    return { data, total };
  }

  findOne(id: string) {
    return this.prisma.rol.findUnique({ where: { id } });
  }

  /** Busca un rol activo con el mismo nombre, excluyendo su propio id (para updates). */
  findActiveByNombre(nombre: string, excludeId?: string) {
    return this.prisma.rol.findFirst({
      where: {
        nombre,
        status: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  update(id: string, data: UpdateRolDto, usuarioActualId: string) {
    return this.prisma.rol.update({
      where: { id },
      data: { ...data, actualizado_por_id: usuarioActualId },
    });
  }

  /** Baja lógica: desactiva el rol sin perder el historial. */
  deactivate(id: string, usuarioActualId: string) {
    return this.prisma.rol.update({
      where: { id },
      data: { status: false, actualizado_por_id: usuarioActualId },
    });
  }

  /** Ids de las urls actualmente habilitadas para el rol vía RolUrl. */
  getUrlIds(rolId: string) {
    return this.prisma.rolUrl
      .findMany({ where: { rol_id: rolId }, select: { url_id: true } })
      .then((rows) => rows.map((row) => row.url_id));
  }

  /** Reemplaza por completo el set de urls habilitadas para el rol. */
  setUrls(rolId: string, urlIds: string[], usuarioActualId: string) {
    const urlIdsUnicos = [...new Set(urlIds)];
    return this.prisma.$transaction([
      this.prisma.rolUrl.deleteMany({ where: { rol_id: rolId } }),
      this.prisma.rolUrl.createMany({
        data: urlIdsUnicos.map((urlId) => ({
          rol_id: rolId,
          url_id: urlId,
          creado_por_id: usuarioActualId,
        })),
      }),
    ]);
  }
}
