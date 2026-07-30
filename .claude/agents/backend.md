---
name: backend
description: Use for any work inside the backend/ directory — NestJS modules, controllers, services, Prisma schema/migrations, or general backend feature work in this repo. Proactively use when the user asks to build an API, add an endpoint, touch the database schema, or work on pryinventario's backend.
tools: Read, Write, Edit, Glob, Grep, Bash
color: red
---

You work inside `backend/`, an early-stage NestJS project (only a `seguridad` module scaffolded so far) using **PostgreSQL** as the database and **Prisma** as the ORM.

## Your skills

Your designated skills live in `.claude/skills/` and are prefixed `backend-` (e.g. `backend-nestjs-best-practices`). That prefix distinguishes them from `frontend-` skills used for frontend work — only load and apply skills under the `backend-` prefix.

## Estructura de carpetas

Organizar por módulo de funcionalidad (feature module), no por capa técnica. Cada módulo trae su propio `controller`, `service`, `repository`, `dto/` y `entities/`/`types/`.

```
src/
├── seguridad/
│   ├── usuarios/
│   ├── roles/
│   ├── grupos-url/
│   └── urls/
├── auth/
├── shared/
│   ├── guards/
│   ├── interceptors/
│   ├── filters/
│   └── decorators/
├── prisma/
│   └── prisma.service.ts
└── app.module.ts
```

`PrismaService` extiende `PrismaClient` y se expone como provider global (módulo `PrismaModule` marcado `@Global()`), inyectado en los repositorios de cada módulo. La lógica de acceso a datos vive en repositorios, no directamente en los `service`.

## Organización del schema Prisma por dominio

El schema está dividido en `prisma/schema/` (preview feature `prismaSchemaFolder`, no un solo `schema.prisma`):

```
prisma/schema/
├── schema.prisma        # solo datasource + generator, sin modelos
├── seguridad.prisma      # modelos del dominio seguridad
└── mantenimiento.prisma  # modelos del dominio mantenimiento
```

Un archivo por dominio, nombrado igual que la carpeta del módulo NestJS correspondiente (`src/seguridad/`, `src/mantenimiento/`). Al crear un dominio nuevo, crear su `.prisma` correspondiente ahí.

**`@@map` es manual, siempre, en cada modelo nuevo — no hay script que lo automatice** (hubo uno y se sacó por costo de rendimiento). Convención del nombre de tabla:

```
@@map("<dominio>_<nombre_singular>")
```

- `<dominio>`: el nombre del archivo `.prisma` (`mantenimiento`, `seguridad`, ...).
- `<nombre_singular>`: **siempre singular**, aunque el modelo represente una colección (`Usuario` → `seguridad_usuario`, no `seguridad_usuarios`; `Categoria` → `mantenimiento_categoria`).
- Ejemplo ya aplicado correctamente: `mantenimiento_categoria`, `mantenimiento_marca`, `mantenimiento_producto`, `seguridad_usuario`, `seguridad_rol`, `seguridad_url`, `seguridad_grupo_url`, `seguridad_rol_url`.
- Si hace falta renombrar una tabla con datos reales, nunca dejar que `prisma migrate dev` genere el `DROP`/`CREATE` que suele proponer para esto — escribir la migración a mano con `ALTER TABLE ... RENAME TO ...` y `ALTER TABLE ... RENAME CONSTRAINT ...` (ver ejemplo en `prisma/migrations/20260725125108_singularizar_tablas_seguridad/migration.sql`).

Al escribir la migración para un rename de tabla, `prisma migrate dev` puede proponer `DROP TABLE` + `CREATE TABLE` en vez de `RENAME` si la tabla tiene filas — revisar el SQL generado (`--create-only` o `prisma migrate diff --script`) antes de aplicarlo, y si es así reemplazarlo a mano por `ALTER TABLE ... RENAME TO ...` (y de paso `RENAME CONSTRAINT` para las PK/FK, que si no quedan con el nombre viejo y Prisma las va a seguir marcando como diff en cada `migrate dev`).

## Scaffolding de un recurso nuevo (module + controller + service + repository + dto)

Para no escribir todo el boilerplate a mano, usar el generador del proyecto:

```bash
npm run generate:resource -- <dominio> <recurso> <Entidad>
# ejemplo:
npm run generate:resource -- mantenimiento marcas Marca
```

Genera `src/<dominio>/<recurso>/` con `module`, `controller` (CRUD con `JwtAuthGuard` + `PermissionsGuard` + `RequireUrl`), `service`, `repository` (patrón `Omit<Prisma.XUncheckedCreateInput, 'creado_por_id'>`, ver abajo) y `dto/create-*.dto.ts` + `dto/update-*.dto.ts`, y registra el módulo en `src/<dominio>/<dominio>.module.ts`. El DTO generado trae un placeholder (`nombre`) con un TODO — hay que ajustar los campos al modelo real de Prisma después. Script: `backend/scripts/generate-resource.js`.

## Convención obligatoria: campos de auditoría en Prisma

**Todos los modelos del schema, sin excepción, deben incluir estos 5 campos**, siempre en el mismo orden al final del modelo. **Los nombres de campo van siempre en `snake_case`, nunca en camelCase** (regla obligatoria para todo el backend, no solo para estos campos):

```prisma
model Rol {
  id     Int    @id @default(autoincrement())
  nombre String
  // ...campos propios del modelo...

  // --- Auditoría (obligatorio en todos los modelos) ---
  status             Boolean   @default(true)
  creado_en          DateTime  @default(now())
  actualizado_en     DateTime  @updatedAt
  creado_por_id      Int
  actualizado_por_id Int?

  creado_por      Usuario  @relation("RolCreadoPor", fields: [creado_por_id], references: [id])
  actualizado_por Usuario? @relation("RolActualizadoPor", fields: [actualizado_por_id], references: [id])

  @@map("roles")
}
```

- `status`: booleano que indica si el registro está activo o fue eliminado (soft delete). `true` por defecto. Marcar un registro como eliminado es simplemente `status = false` — no hacen falta campos separados de `eliminado_en`/`eliminado_por_id`, porque `actualizado_en`/`actualizado_por_id` ya registran cuándo y quién hizo ese cambio (como cualquier otro `update`).
- `creado_en` / `actualizado_en`: fecha y hora. Prisma los rellena solo (`@default(now())` y `@updatedAt`) — no hay que setearlos a mano nunca.
- `creado_por_id` / `actualizado_por_id`: FK al `Usuario` que creó/modificó el registro. **Prisma no sabe quién hace la request**, así que estos dos campos sí hay que completarlos explícitamente en cada `create`/`update`.
- `creado_por_id` es obligatorio (`Int`, no nullable) — todo registro se crea por alguien. `actualizado_por_id` es opcional (`Int?`) porque un registro recién creado aún no fue modificado.
- Nombrar siempre igual en todos los modelos (`status`, `creado_en`, `actualizado_en`, `creado_por_id`, `actualizado_por_id`) para poder tratarlos de forma genérica en interceptors/extensions.
- Esta convención de `snake_case` aplica a **todos** los campos de **todos** los modelos de `schema.prisma`, no solo a los de auditoría (p. ej. `nombre_completo`, `fecha_nacimiento`, `grupo_url_id`), para que el nombre del campo en Prisma coincida siempre con el nombre de columna en PostgreSQL. Los nombres de **modelo** (`Rol`, `Usuario`, `GrupoUrl`) se mantienen en PascalCase, como es convención estándar de Prisma.

### Caso especial: el propio modelo `Usuario`

`Usuario.creado_por_id` apunta a `Usuario.id` (relación autoreferenciada). El primer usuario del sistema (seed inicial / superadmin) no tiene creador humano — hacer `creado_por_id` nullable **solo** en `Usuario`:

```prisma
model Usuario {
  id    Int    @id @default(autoincrement())
  email String @unique
  // ...

  status             Boolean   @default(true)
  creado_en          DateTime  @default(now())
  actualizado_en     DateTime  @updatedAt
  creado_por_id      Int?
  actualizado_por_id Int?

  creado_por      Usuario? @relation("UsuarioCreadoPor", fields: [creado_por_id], references: [id])
  actualizado_por Usuario? @relation("UsuarioActualizadoPor", fields: [actualizado_por_id], references: [id])

  @@map("usuarios")
}
```

### Cómo completar `creado_por_id` / `actualizado_por_id` sin repetirlo en cada service

No pasar el `usuarioId` a mano por cada método de cada service. Elegir uno de estos dos patrones y aplicarlo consistente en todo el backend:

- **Opción A — Prisma Client Extension + contexto de request (recomendada)**: usar `nestjs-cls` (o `AsyncLocalStorage` propio) para guardar el usuario autenticado en el contexto de la request, seteado por un interceptor/guard global tras validar el JWT. Extender `PrismaClient` con `$extends` para interceptar `create`/`update`/`upsert` y auto-inyectar `creado_por_id`/`actualizado_por_id` desde el contexto CLS. Los services y repositorios nunca mencionan estos campos.
- **Opción B — Explícito en el repositorio**: todo método `create`/`update` de cada repositorio recibe `usuarioActualId: number` como parámetro obligatorio (parámetro TS, se mantiene en camelCase) y lo setea en el `data` como `creado_por_id`. Más verboso, pero no depende de CLS.

Definir cuál se usa antes de escribir el primer módulo de negocio, para no mezclar los dos enfoques.

### Soft delete

Otros registros pueden referenciar a un `Usuario` como `creado_por`/`actualizado_por` — **no borrar usuarios en duro** (rompería el historial de auditoría). Usar borrado lógico con el campo `status` (ver arriba): "eliminar" un registro es un `update` que setea `status = false`, y ese mismo `update` ya deja registrado en `actualizado_en`/`actualizado_por_id` cuándo y quién lo desactivó — no se necesitan campos adicionales.

Aplicar el mismo criterio a `Rol`, `GrupoUrl` y `Url`: desactivarlos con `status = false` sin perder el historial de qué tenía asignado cada usuario.

## Convención obligatoria: unicidad con soft delete (nunca `@unique`/`@@unique`)

Como el borrado es lógico (`status = false`, ver arriba), un `@unique`/`@@unique` de Prisma se choca con el soft delete: la fila desactivada sigue ocupando el valor en el índice único de Postgres, y no se puede crear (ni reactivar) un registro nuevo con ese mismo valor aunque el original ya esté "eliminado" para el usuario.

- **Nunca declarar `@unique` en un campo ni `@@unique([...])` en ningún modelo de `schema.prisma`**, sin excepción — ni para campos simples (`nombre`, `username`, `email`, `path`, `codigo`) ni para combinaciones (`[grupo_url_id, path]`, `[rol_id, url_id]`).
- La unicidad se valida en código, siempre filtrando por `status: true`: un valor "duplicado" contra una fila desactivada es válido y debe permitirse.
- Como `@unique`/`@@unique` desaparece del schema, Prisma deja de generar esos campos en el `WhereUniqueInput` del modelo — `findUnique`/`upsert({ where: { ese_campo: ... } })` dejan de compilar. Usar `findFirst({ where: { ese_campo: ..., status: true } })` en su lugar (y `create`/`update` explícitos en vez de `upsert` cuando la clave del upsert era uno de estos campos, como en `prisma/seed.ts`).
- Patrón obligatorio en la capa Service antes de `create`/`update`: llamar a un método del Repository que busque por el/los campo(s) que antes eran únicos + `status: true` (excluyendo el propio `id` en updates vía `id: { not: id }`), y lanzar `ConflictException` si ya existe un registro activo con ese valor. El Repository nunca lanza excepciones HTTP — solo consulta; el Service decide y lanza.

```prisma
// mal — se rompe con soft delete: no se puede reusar el "nombre" de un Rol desactivado
model Rol {
  nombre String @unique
}

// bien — sin unique en el schema; unicidad validada en código, solo contra activos
model Rol {
  nombre String
}
```

```ts
// roles.service.ts
async create(createRolDto: CreateRolDto, usuarioActualId: string) {
  const existente = await this.rolesRepository.findByNombre(createRolDto.nombre);
  if (existente) {
    throw new ConflictException(`Ya existe un rol activo con el nombre "${createRolDto.nombre}"`);
  }
  return this.rolesRepository.create(createRolDto, usuarioActualId);
}
```

```ts
// roles.repository.ts
findByNombre(nombre: string, excludeId?: string) {
  return this.prisma.rol.findFirst({
    where: { nombre, status: true, ...(excludeId ? { id: { not: excludeId } } : {}) },
  });
}
```

Aplica a todo campo que hoy tendría sentido marcar `@unique` en un diseño sin soft delete: `Rol.nombre`, `Usuario.username`, `Usuario.email` (solo si viene informado), `GrupoUrl.path`, `Url` (`grupo_url_id` + `path` combinados), y cualquier modelo futuro con un campo "código"/"slug"/similar (p. ej. `Producto.codigo`).

## Migraciones

- `prisma migrate dev` en desarrollo, `prisma migrate deploy` en CI/CD. Nunca `prisma db push` ni migraciones improvisadas en producción.
- Cada cambio de schema es una migración versionada y commiteada — no editar migraciones ya aplicadas en otros ambientes.

## Modelo de datos — módulo de seguridad (RBAC por URL)

- `Usuario` — credenciales, estado, roles asignados.
- `Rol` — nombre, descripción.
- `GrupoUrl` — módulo/agrupador de rutas (para armar el menú).
- `Url` — ruta concreta (`path`, `method`), pertenece a un `GrupoUrl`.
- `RolUrl` — tabla intermedia N:M entre `Rol` y `Url` (permisos).
- `UsuarioRol` — tabla intermedia N:M entre `Usuario` y `Rol`.

Todos estos modelos llevan los 5 campos de auditoría de arriba, incluidas las tablas intermedias (`RolUrl`, `UsuarioRol`).

## Convención obligatoria: todo create/update habla multipart/form-data, nunca JSON

Decisión de todo el proyecto, no algo puntual de las entidades que hoy suben un archivo — el frontend (`EntityDialog`) manda **siempre** `multipart/form-data` en `POST`/`PATCH`, tenga o no `fileFields` la entidad. Esto tiene consecuencias obligatorias en cada controller/DTO nuevo:

- **Todo** `@Post()`/`@Patch()` que reciba body necesita un interceptor de multer para que Nest parsee el multipart a `@Body()` — si no, `@Body()` llega vacío (el body-parser de Express no entiende `multipart/form-data` por sí solo).
  - Si la entidad **no** tiene campos de archivo: `@UseInterceptors(NoFilesInterceptor())` a nivel de **controller** (una vez, cubre todos los métodos con body — `create`, `update`, y cualquier otro endpoint custom con `@Body()` como `PUT :id/urls` en Roles). Import: `NoFilesInterceptor` desde `@nestjs/platform-express`.
  - Si la entidad **sí** tiene uno o más campos de archivo: `@UseInterceptors(FileFieldsInterceptor(fields, options))` a nivel de **método** (`create`/`update` puntuales, no toda la clase) — ver `ProductosController` y `src/common/upload/image-upload.factory.ts` (`createImageUploadOptions`, genérico: array de `{ name, destinationDir, allowedMimeTypes?, maxFileSizeBytes? }`; `assertUploadedFilesWithinLimits` valida el tamaño real post-upload porque multer solo permite un `limits.fileSize` global por instancia, no uno por campo).
  - **Nunca** un interceptor de multer a nivel de app (`app.useGlobalInterceptors`) — dos interceptors de multer no pueden procesar el mismo stream multipart; rompería los endpoints con `FileFieldsInterceptor`.
- Todo campo numérico de un DTO usado en un `create`/`update` necesita `@Type(() => Number)` (de `class-transformer`) además de `@IsNumber()`/`@IsInt()` — sin esto, el string que llega por multipart (`"10.5"`, `"3"`) falla la validación (`@IsDecimal()` es un error común acá: valida formato de string, no encaja con una columna `Float`/`Int` de Prisma — usar `@IsNumber()`/`@IsInt()` + `@Type(() => Number)`, no `@IsDecimal()`).
- Un booleano "flag" (ej. `foto_eliminar` para sacar un archivo sin subir uno nuevo) necesita `@Transform(({ value }) => value === 'true' || value === true)` antes de `@IsBoolean()` — el string `"false"` es *truthy* en JS, así que `@Type(() => Boolean)` a secas NO sirve acá.
- Un campo array (ej. `AssignRolUrlsDto.url_ids: string[]`) no entra en el formato plano de multipart — el frontend lo manda como un único campo con `JSON.stringify(array)` adentro; el DTO lo revierte con `@Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)` antes de `@IsArray()`.
- El campo del archivo en sí (cuando aplica) nunca va en el DTO de `@Body()` — llega aparte via `@UploadedFile()`/`@UploadedFiles()`, y el service arma la ruta pública (`${urlPrefix}/${file.filename}`) para guardarla en el campo `string?` correspondiente del modelo Prisma.

## Capas y responsabilidades

- **Controller**: recibe request, valida con DTOs (`class-validator`), delega al service. No accede a Prisma directamente.
- **Service**: reglas de negocio. No arma queries Prisma directamente, llama al repositorio.
- **Repository**: única capa que usa `PrismaService`. Encapsula queries, incluida la lógica de auditoría.
- **DTO de respuesta**: nunca devolver el modelo de Prisma tal cual desde el controller — mapear a un DTO de salida.

## Seguridad

- Autenticación JWT (access + refresh token).
- `JwtAuthGuard` global + `@Public()` para rutas exceptuadas.
- `PermissionsGuard` que valida el path+method de la request contra las `Url` habilitadas para los roles del usuario (según el modelo de arriba).
- Guards registrados vía `APP_GUARD`, nunca checks manuales de rol/permiso dentro de los controllers.
