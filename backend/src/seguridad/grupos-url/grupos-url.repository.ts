import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGrupoUrlDto } from './dto/create-grupo-url.dto';
import { UpdateGrupoUrlDto } from './dto/update-grupo-url.dto';

@Injectable()
export class GruposUrlRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateGrupoUrlDto, usuarioActualId: string) {
    return this.prisma.grupoUrl.create({
      data: { ...data, creado_por_id: usuarioActualId },
    });
  }

  findAll() {
    return this.prisma.grupoUrl.findMany({
      where: { status: true },
      orderBy: { orden: 'asc' },
      include: {
        urls: { where: { status: true }, orderBy: { orden: 'asc' } },
      },
    });
  }

  async findAllPaginated(page: number, limit: number) {
    const [data, total] = await this.prisma.$transaction([
      this.prisma.grupoUrl.findMany({
        where: { status: true },
        orderBy: { orden: 'asc' },
        include: {
          urls: { where: { status: true }, orderBy: { orden: 'asc' } },
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.grupoUrl.count({ where: { status: true } }),
    ]);
    return { data, total };
  }

  findOne(id: string) {
    return this.prisma.grupoUrl.findUnique({
      where: { id },
      include: {
        urls: { where: { status: true }, orderBy: { orden: 'asc' } },
      },
    });
  }

  /** Busca un grupo de urls activo con el mismo path, excluyendo su propio id (para updates). */
  findActiveByPath(path: string, excludeId?: string) {
    return this.prisma.grupoUrl.findFirst({
      where: {
        path,
        status: true,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
  }

  update(id: string, data: UpdateGrupoUrlDto, usuarioActualId: string) {
    return this.prisma.grupoUrl.update({
      where: { id },
      data: { ...data, actualizado_por_id: usuarioActualId },
    });
  }

  /** Baja lógica: desactiva el grupo sin perder el historial. */
  deactivate(id: string, usuarioActualId: string) {
    return this.prisma.grupoUrl.update({
      where: { id },
      data: { status: false, actualizado_por_id: usuarioActualId },
    });
  }
}
