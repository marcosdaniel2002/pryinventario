-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "actualizado_por_id" TEXT,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "rol_id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por_id" TEXT,
    "actualizado_por_id" TEXT,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "grupos_url" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "actualizado_por_id" TEXT,

    CONSTRAINT "grupos_url_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urls" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "icono" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "grupo_url_id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "actualizado_por_id" TEXT,

    CONSTRAINT "urls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rol_url" (
    "id" TEXT NOT NULL,
    "rol_id" TEXT NOT NULL,
    "url_id" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "actualizado_por_id" TEXT,

    CONSTRAINT "rol_url_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_username_key" ON "usuarios"("username");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "grupos_url_path_key" ON "grupos_url"("path");

-- CreateIndex
CREATE UNIQUE INDEX "urls_grupo_url_id_path_key" ON "urls"("grupo_url_id", "path");

-- CreateIndex
CREATE UNIQUE INDEX "rol_url_rol_id_url_id_key" ON "rol_url"("rol_id", "url_id");

-- AddForeignKey
-- NOTA: DEFERRABLE INITIALLY DEFERRED es una excepción deliberada, no generada
-- por `prisma migrate diff`. Rol.creado_por_id (obligatorio) y
-- Usuario.rol_id (obligatorio) se referencian mutuamente, así que el primer
-- Rol y el primer Usuario del sistema (seed de bootstrap) no pueden
-- insertarse en ningún orden sin violar uno de los dos FKs. Al diferir la
-- validación de este FK hasta el COMMIT de la transacción, el seed puede
-- insertar ambas filas en la misma transacción y quedar consistente al
-- confirmar. Ver prisma/seed.ts.
ALTER TABLE "roles" ADD CONSTRAINT "roles_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "roles" ADD CONSTRAINT "roles_actualizado_por_id_fkey" FOREIGN KEY ("actualizado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
-- NOTA: ver comentario arriba sobre "roles_creado_por_id_fkey" — mismo
-- ciclo de bootstrap, visto desde el lado de Usuario.rol_id.
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_actualizado_por_id_fkey" FOREIGN KEY ("actualizado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_url" ADD CONSTRAINT "grupos_url_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "grupos_url" ADD CONSTRAINT "grupos_url_actualizado_por_id_fkey" FOREIGN KEY ("actualizado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_grupo_url_id_fkey" FOREIGN KEY ("grupo_url_id") REFERENCES "grupos_url"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urls" ADD CONSTRAINT "urls_actualizado_por_id_fkey" FOREIGN KEY ("actualizado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_url" ADD CONSTRAINT "rol_url_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_url" ADD CONSTRAINT "rol_url_url_id_fkey" FOREIGN KEY ("url_id") REFERENCES "urls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_url" ADD CONSTRAINT "rol_url_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rol_url" ADD CONSTRAINT "rol_url_actualizado_por_id_fkey" FOREIGN KEY ("actualizado_por_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
