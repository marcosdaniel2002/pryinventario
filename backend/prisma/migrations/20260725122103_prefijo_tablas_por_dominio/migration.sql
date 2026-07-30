-- Renombra las tablas para prefijarlas por dominio (seguridad_ / mantenimiento_).
-- Usa RENAME en vez de DROP/CREATE para no perder los datos existentes.

ALTER TABLE "roles" RENAME TO "seguridad_roles";
ALTER TABLE "usuarios" RENAME TO "seguridad_usuarios";
ALTER TABLE "grupos_url" RENAME TO "seguridad_grupos_url";
ALTER TABLE "urls" RENAME TO "seguridad_urls";
ALTER TABLE "rol_url" RENAME TO "seguridad_rol_url";

ALTER TABLE "Categoria" RENAME TO "mantenimiento_categoria";
ALTER TABLE "Marca" RENAME TO "mantenimiento_marca";
ALTER TABLE "producto" RENAME TO "mantenimiento_producto";
