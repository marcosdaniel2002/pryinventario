import { randomUUID } from 'crypto';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = bcrypt.hashSync('1234', 10);

  // --- Bootstrap: Rol Administrador <-> Usuario admin ---
  //
  // Rol.creado_por_id es obligatorio (apunta a un Usuario) y
  // Usuario.rol_id también es obligatorio (apunta a un Rol), así que el
  // primer Rol y el primer Usuario del sistema se referencian mutuamente
  // sin que ninguno de los dos exista todavía. Para resolver ese ciclo,
  // ambos inserts se ejecutan dentro de la misma transacción, apoyándose
  // en que los FKs `usuarios_rol_id_fkey` y `roles_creado_por_id_fkey`
  // se crearon como DEFERRABLE INITIALLY DEFERRED (ver migración): Postgres
  // sólo valida esas dos referencias al hacer COMMIT, momento en el que
  // ambas filas ya existen.
  //
  // Nota: `username`/`nombre` (Rol) ya no tienen `@unique` en el schema
  // (ver "Convención obligatoria: unicidad con soft delete" en
  // .claude/agents/backend.md), así que no se puede usar `upsert` con esos
  // campos como `where`. En su lugar: buscar con `findFirst` filtrando por
  // `status: true` y crear sólo si no existe un registro activo.
  let usuarioAdmin = await prisma.usuario.findFirst({
    where: { username: 'admin', status: true },
    include: { rol: true },
  });
  let rolAdmin = usuarioAdmin?.rol ?? null;

  if (!usuarioAdmin || !rolAdmin) {
    const rolAdminId = randomUUID();

    const bootstrap = await prisma.$transaction(async (tx) => {
      const usuario = await tx.usuario.create({
        data: {
          username: 'admin',
          password: hashedPassword,
          nombre: 'Administrador',
          rol_id: rolAdminId,
          creado_por_id: null,
        },
      });

      const rol = await tx.rol.create({
        data: {
          id: rolAdminId,
          nombre: 'Administrador',
          descripcion: 'Rol con acceso total al sistema',
          creado_por_id: usuario.id,
        },
      });

      return { usuario, rol };
    });

    usuarioAdmin = { ...bootstrap.usuario, rol: bootstrap.rol };
    rolAdmin = bootstrap.rol;
  }

  // 3. GrupoUrl Administración
  let grupoAdministracion = await prisma.grupoUrl.findFirst({
    where: { path: 'seguridad', status: true },
  });
  if (!grupoAdministracion) {
    grupoAdministracion = await prisma.grupoUrl.create({
      data: {
        nombre: 'Administración',
        path: 'seguridad',
        orden: 1,
        creado_por_id: usuarioAdmin.id,
      },
    });
  }

  // 4. Urls hijas del grupo
  async function upsertUrl(nombre: string, path: string, orden: number) {
    const existente = await prisma.url.findFirst({
      where: {
        grupo_url_id: grupoAdministracion!.id,
        path,
        status: true,
      },
    });
    if (existente) {
      return existente;
    }
    return prisma.url.create({
      data: {
        nombre,
        path,
        orden,
        grupo_url_id: grupoAdministracion!.id,
        creado_por_id: usuarioAdmin!.id,
      },
    });
  }

  const urlUsuarios = await upsertUrl('Usuarios', 'usuarios', 1);
  const urlGruposUrl = await upsertUrl('Grupos Url', 'grupos-url', 2);
  const urlRoles = await upsertUrl('Roles', 'roles', 3);
  const urlUrls = await upsertUrl('Urls', 'urls', 4);

  // 5. RolUrl: el rol Administrador puede ver las cuatro urls
  async function upsertRolUrl(rolId: string, urlId: string) {
    const existente = await prisma.rolUrl.findFirst({
      where: { rol_id: rolId, url_id: urlId, status: true },
    });
    if (existente) {
      return existente;
    }
    return prisma.rolUrl.create({
      data: {
        rol_id: rolId,
        url_id: urlId,
        creado_por_id: usuarioAdmin!.id,
      },
    });
  }

  await upsertRolUrl(rolAdmin.id, urlUsuarios.id);
  await upsertRolUrl(rolAdmin.id, urlGruposUrl.id);
  await upsertRolUrl(rolAdmin.id, urlRoles.id);
  await upsertRolUrl(rolAdmin.id, urlUrls.id);

  // 6. Rol Editor: acceso restringido, solo demuestra permisos por url
  let rolEditor = await prisma.rol.findFirst({
    where: { nombre: 'Editor', status: true },
  });
  if (!rolEditor) {
    rolEditor = await prisma.rol.create({
      data: {
        nombre: 'Editor',
        descripcion: 'Acceso de solo lectura a la gestión de usuarios',
        creado_por_id: usuarioAdmin.id,
      },
    });
  }

  // 7. Usuario editor
  let usuarioEditor = await prisma.usuario.findFirst({
    where: { username: 'editor', status: true },
  });
  if (!usuarioEditor) {
    usuarioEditor = await prisma.usuario.create({
      data: {
        username: 'editor',
        password: hashedPassword,
        nombre: 'Editor',
        rol_id: rolEditor.id,
        creado_por_id: usuarioAdmin.id,
      },
    });
  }

  // 8. RolUrl: el rol Editor solo puede ver la url de Usuarios
  await upsertRolUrl(rolEditor.id, urlUsuarios.id);

  // 9. Configuracion de la pagina (singleton: un solo registro activo)
  let configuracion = await prisma.configuracion.findFirst({
    where: { status: true },
  });
  if (!configuracion) {
    configuracion = await prisma.configuracion.create({
      data: {
        nombre: 'StockHub',
        descripcion: 'Sistema de inventario y gestión de StockHub',
        celular: '+52 55 1234 5678',
        correo: 'contacto@stockhub.com',
        creado_por_id: usuarioAdmin.id,
      },
    });
  }

  console.log('Seed completado:');
  console.log(`  Rol:        ${rolAdmin.nombre} (${rolAdmin.id})`);
  console.log(`  Usuario:    ${usuarioAdmin.username} / password: 1234 (${usuarioAdmin.id})`);
  console.log(`  GrupoUrl:   ${grupoAdministracion.nombre} -> /${grupoAdministracion.path}`);
  console.log(`  Url:        ${urlUsuarios.nombre} -> /${grupoAdministracion.path}/${urlUsuarios.path}`);
  console.log(`  Url:        ${urlGruposUrl.nombre} -> /${grupoAdministracion.path}/${urlGruposUrl.path}`);
  console.log(`  Url:        ${urlRoles.nombre} -> /${grupoAdministracion.path}/${urlRoles.path}`);
  console.log(`  Url:        ${urlUrls.nombre} -> /${grupoAdministracion.path}/${urlUrls.path}`);
  console.log(`  RolUrl:     ${rolAdmin.nombre} habilitado para las cuatro urls`);
  console.log(`  Rol:        ${rolEditor.nombre} (${rolEditor.id})`);
  console.log(`  Usuario:    ${usuarioEditor.username} / password: 1234 (${usuarioEditor.id})`);
  console.log(`  RolUrl:     ${rolEditor.nombre} habilitado solo para ${urlUsuarios.nombre}`);
  console.log(`  Configuracion: ${configuracion.nombre} (${configuracion.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
