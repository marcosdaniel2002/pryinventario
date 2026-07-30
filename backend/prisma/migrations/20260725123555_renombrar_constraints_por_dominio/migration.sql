-- AlterTable
ALTER TABLE "mantenimiento_categoria" RENAME CONSTRAINT "Categoria_pkey" TO "mantenimiento_categoria_pkey";

-- AlterTable
ALTER TABLE "mantenimiento_marca" RENAME CONSTRAINT "Marca_pkey" TO "mantenimiento_marca_pkey";

-- AlterTable
ALTER TABLE "mantenimiento_producto" RENAME CONSTRAINT "producto_pkey" TO "mantenimiento_producto_pkey";

-- AlterTable
ALTER TABLE "seguridad_grupos_url" RENAME CONSTRAINT "grupos_url_pkey" TO "seguridad_grupos_url_pkey";

-- AlterTable
ALTER TABLE "seguridad_rol_url" RENAME CONSTRAINT "rol_url_pkey" TO "seguridad_rol_url_pkey";

-- AlterTable
ALTER TABLE "seguridad_roles" RENAME CONSTRAINT "roles_pkey" TO "seguridad_roles_pkey";

-- AlterTable
ALTER TABLE "seguridad_urls" RENAME CONSTRAINT "urls_pkey" TO "seguridad_urls_pkey";

-- AlterTable
ALTER TABLE "seguridad_usuarios" RENAME CONSTRAINT "usuarios_pkey" TO "seguridad_usuarios_pkey";

-- RenameForeignKey
ALTER TABLE "mantenimiento_producto" RENAME CONSTRAINT "producto_actualizado_por_id_fkey" TO "mantenimiento_producto_actualizado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "mantenimiento_producto" RENAME CONSTRAINT "producto_categoria_id_fkey" TO "mantenimiento_producto_categoria_id_fkey";

-- RenameForeignKey
ALTER TABLE "mantenimiento_producto" RENAME CONSTRAINT "producto_creado_por_id_fkey" TO "mantenimiento_producto_creado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "mantenimiento_producto" RENAME CONSTRAINT "producto_marca_id_fkey" TO "mantenimiento_producto_marca_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_grupos_url" RENAME CONSTRAINT "grupos_url_actualizado_por_id_fkey" TO "seguridad_grupos_url_actualizado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_grupos_url" RENAME CONSTRAINT "grupos_url_creado_por_id_fkey" TO "seguridad_grupos_url_creado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_rol_url" RENAME CONSTRAINT "rol_url_actualizado_por_id_fkey" TO "seguridad_rol_url_actualizado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_rol_url" RENAME CONSTRAINT "rol_url_creado_por_id_fkey" TO "seguridad_rol_url_creado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_rol_url" RENAME CONSTRAINT "rol_url_rol_id_fkey" TO "seguridad_rol_url_rol_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_rol_url" RENAME CONSTRAINT "rol_url_url_id_fkey" TO "seguridad_rol_url_url_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_roles" RENAME CONSTRAINT "roles_actualizado_por_id_fkey" TO "seguridad_roles_actualizado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_roles" RENAME CONSTRAINT "roles_creado_por_id_fkey" TO "seguridad_roles_creado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_urls" RENAME CONSTRAINT "urls_actualizado_por_id_fkey" TO "seguridad_urls_actualizado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_urls" RENAME CONSTRAINT "urls_creado_por_id_fkey" TO "seguridad_urls_creado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_urls" RENAME CONSTRAINT "urls_grupo_url_id_fkey" TO "seguridad_urls_grupo_url_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_usuarios" RENAME CONSTRAINT "usuarios_actualizado_por_id_fkey" TO "seguridad_usuarios_actualizado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_usuarios" RENAME CONSTRAINT "usuarios_creado_por_id_fkey" TO "seguridad_usuarios_creado_por_id_fkey";

-- RenameForeignKey
ALTER TABLE "seguridad_usuarios" RENAME CONSTRAINT "usuarios_rol_id_fkey" TO "seguridad_usuarios_rol_id_fkey";

