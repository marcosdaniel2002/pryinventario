#!/usr/bin/env node
/**
 * Genera module + controller + service + repository + dto (create/update)
 * siguiendo el patron usado en usuarios/ y productos/.
 *
 * Uso:
 *   node scripts/generate-resource.js <dominio> <recurso> <Entidad>
 *   npm run generate:resource -- <dominio> <recurso> <Entidad>
 *
 * Ejemplo:
 *   node scripts/generate-resource.js mantenimiento marcas Marca
 *   -> crea src/mantenimiento/marcas/{marcas.module.ts, marcas.controller.ts,
 *      marcas.service.ts, marcas.repository.ts, dto/create-marca.dto.ts,
 *      dto/update-marca.dto.ts}
 *   -> registra MarcasModule dentro de src/mantenimiento/mantenimiento.module.ts
 */
const fs = require('fs');
const path = require('path');

const [, , dominio, recurso, entidad] = process.argv;

if (!dominio || !recurso || !entidad) {
  console.error(
    'Uso: node scripts/generate-resource.js <dominio> <recurso> <Entidad>\n' +
      'Ejemplo: node scripts/generate-resource.js mantenimiento marcas Marca',
  );
  process.exit(1);
}

const toKebab = (str) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
const lowerFirst = (str) => str.charAt(0).toLowerCase() + str.slice(1);

const resourceClass = capitalize(recurso); // Marcas
const resourceCamel = lowerFirst(recurso); // marcas
const entidadKebab = toKebab(entidad); // marca / grupo-url
const entidadCamel = lowerFirst(entidad); // marca / grupoUrl

const srcRoot = path.join(__dirname, '..', 'src');
const resourceDir = path.join(srcRoot, dominio, recurso);
const dtoDir = path.join(resourceDir, 'dto');

if (fs.existsSync(resourceDir)) {
  console.error(`Ya existe ${path.relative(process.cwd(), resourceDir)}. Abortando.`);
  process.exit(1);
}

fs.mkdirSync(dtoDir, { recursive: true });

const files = {
  [`${recurso}.module.ts`]: `import { Module } from '@nestjs/common';
import { ${resourceClass}Service } from './${recurso}.service';
import { ${resourceClass}Controller } from './${recurso}.controller';
import { ${resourceClass}Repository } from './${recurso}.repository';

@Module({
  controllers: [${resourceClass}Controller],
  providers: [${resourceClass}Service, ${resourceClass}Repository],
  exports: [${resourceClass}Service, ${resourceClass}Repository],
})
export class ${resourceClass}Module {}
`,

  [`${recurso}.controller.ts`]: `import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { ${resourceClass}Service } from './${recurso}.service';
import { Create${entidad}Dto } from './dto/create-${entidadKebab}.dto';
import { Update${entidad}Dto } from './dto/update-${entidadKebab}.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { PermissionsGuard } from 'src/auth/permissions.guard';
import { RequireUrl } from 'src/auth/require-url.decorator';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequireUrl('${dominio}', '${recurso}')
@Controller('${dominio}/${recurso}')
export class ${resourceClass}Controller {
  constructor(private readonly ${resourceCamel}Service: ${resourceClass}Service) {}

  private currentUserId(req: Request): string {
    return (req.user as { id: string }).id;
  }

  @Post()
  create(@Body() create${entidad}Dto: Create${entidad}Dto, @Req() req: Request) {
    return this.${resourceCamel}Service.create(
      create${entidad}Dto,
      this.currentUserId(req),
    );
  }

  @Get()
  findAll() {
    return this.${resourceCamel}Service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.${resourceCamel}Service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() update${entidad}Dto: Update${entidad}Dto,
    @Req() req: Request,
  ) {
    return this.${resourceCamel}Service.update(
      id,
      update${entidad}Dto,
      this.currentUserId(req),
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    return this.${resourceCamel}Service.remove(id, this.currentUserId(req));
  }
}
`,

  [`${recurso}.service.ts`]: `import { Injectable, NotFoundException } from '@nestjs/common';
import { ${resourceClass}Repository } from './${recurso}.repository';
import { Create${entidad}Dto } from './dto/create-${entidadKebab}.dto';
import { Update${entidad}Dto } from './dto/update-${entidadKebab}.dto';

@Injectable()
export class ${resourceClass}Service {
  constructor(private readonly ${resourceCamel}Repository: ${resourceClass}Repository) {}

  create(create${entidad}Dto: Create${entidad}Dto, usuarioActualId: string) {
    return this.${resourceCamel}Repository.create(create${entidad}Dto, usuarioActualId);
  }

  findAll() {
    return this.${resourceCamel}Repository.findAll();
  }

  async findOne(id: string) {
    const ${entidadCamel} = await this.${resourceCamel}Repository.findOne(id);
    if (!${entidadCamel}) {
      throw new NotFoundException(\`${entidad} con id \${id} no encontrado\`);
    }
    return ${entidadCamel};
  }

  async update(
    id: string,
    update${entidad}Dto: Update${entidad}Dto,
    usuarioActualId: string,
  ) {
    await this.findOne(id);
    return this.${resourceCamel}Repository.update(id, update${entidad}Dto, usuarioActualId);
  }

  async remove(id: string, usuarioActualId: string) {
    await this.findOne(id);
    return this.${resourceCamel}Repository.deactivate(id, usuarioActualId);
  }
}
`,

  [`${recurso}.repository.ts`]: `import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ${resourceClass}Repository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Omit<Prisma.${entidad}UncheckedCreateInput, 'creado_por_id'>,
    usuarioActualId: string,
  ) {
    return this.prisma.${entidadCamel}.create({
      data: { ...data, creado_por_id: usuarioActualId },
    });
  }

  findAll() {
    return this.prisma.${entidadCamel}.findMany({
      where: { status: true },
    });
  }

  findOne(id: string) {
    return this.prisma.${entidadCamel}.findUnique({
      where: { id },
    });
  }

  update(
    id: string,
    data: Prisma.${entidad}UncheckedUpdateInput,
    usuarioActualId: string,
  ) {
    return this.prisma.${entidadCamel}.update({
      where: { id },
      data: { ...data, actualizado_por_id: usuarioActualId },
    });
  }

  /** Baja logica: desactiva el registro sin perder el historial. */
  deactivate(id: string, usuarioActualId: string) {
    return this.prisma.${entidadCamel}.update({
      where: { id },
      data: { status: false, actualizado_por_id: usuarioActualId },
    });
  }
}
`,

  [path.join('dto', `create-${entidadKebab}.dto.ts`)]: `import { IsNotEmpty, IsString } from 'class-validator';

// TODO: ajustar los campos segun el modelo ${entidad} en prisma/schema.prisma
export class Create${entidad}Dto {
  @IsString()
  @IsNotEmpty()
  nombre: string;
}
`,

  [path.join('dto', `update-${entidadKebab}.dto.ts`)]: `import { PartialType } from '@nestjs/mapped-types';
import { Create${entidad}Dto } from './create-${entidadKebab}.dto';

export class Update${entidad}Dto extends PartialType(Create${entidad}Dto) {}
`,
};

for (const [relativePath, content] of Object.entries(files)) {
  const filePath = path.join(resourceDir, relativePath);
  fs.writeFileSync(filePath, content);
  console.log(`creado: ${path.relative(process.cwd(), filePath)}`);
}

// Intenta registrar el nuevo module en src/<dominio>/<dominio>.module.ts
const domainModulePath = path.join(srcRoot, dominio, `${dominio}.module.ts`);
if (fs.existsSync(domainModulePath)) {
  let content = fs.readFileSync(domainModulePath, 'utf8');
  const importLine = `import { ${resourceClass}Module } from './${recurso}/${recurso}.module';\n`;

  if (!content.includes(importLine.trim())) {
    const importMatches = [...content.matchAll(/^import .*;$/gm)];
    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const insertAt = lastImport.index + lastImport[0].length;
      content = content.slice(0, insertAt) + '\n' + importLine.trimEnd() + content.slice(insertAt);
    } else {
      content = importLine + content;
    }

    content = content.replace(/imports:\s*\[([^\]]*)\]/, (match, inner) => {
      const trimmed = inner.trim();
      const newInner = trimmed ? `${trimmed}, ${resourceClass}Module` : `${resourceClass}Module`;
      return `imports: [${newInner}]`;
    });

    fs.writeFileSync(domainModulePath, content);
    console.log(`actualizado: ${path.relative(process.cwd(), domainModulePath)} (registrado ${resourceClass}Module)`);
  }
} else {
  console.log(
    `Aviso: no existe ${path.relative(process.cwd(), domainModulePath)}. ` +
      `Registra ${resourceClass}Module manualmente donde corresponda.`,
  );
}

console.log('\nListo. Revisa los DTOs generados y ajusta los campos segun tu modelo de Prisma.');
