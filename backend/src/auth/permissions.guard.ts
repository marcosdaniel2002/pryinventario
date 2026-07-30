import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { REQUIRED_URL_KEY, RequiredUrl } from './require-url.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<
      RequiredUrl | undefined
    >(REQUIRED_URL_KEY, [context.getHandler(), context.getClass()]);

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const rolId = (request.user as { rolId?: string } | undefined)?.rolId;

    if (!rolId) {
      return false;
    }

    const grant = await this.prisma.rolUrl.findFirst({
      where: {
        rol_id: rolId,
        url: {
          path: required.urlPath,
          status: true,
          grupo_url: { path: required.grupoPath, status: true },
        },
      },
    });

    if (!grant) {
      throw new ForbiddenException(
        'Tu rol no tiene permiso para acceder a este recurso',
      );
    }

    return true;
  }
}
