-- Singulariza los nombres de tabla del dominio seguridad para respetar la
-- convencion <dominio>_<nombre_singular>. Usa RENAME (no DROP/CREATE) para
-- no perder los datos existentes.

ALTER TABLE "seguridad_roles" RENAME TO "seguridad_rol";
ALTER TABLE "seguridad_usuarios" RENAME TO "seguridad_usuario";
ALTER TABLE "seguridad_grupos_url" RENAME TO "seguridad_grupo_url";
ALTER TABLE "seguridad_urls" RENAME TO "seguridad_url";

ALTER TABLE "seguridad_rol" RENAME CONSTRAINT "seguridad_roles_pkey" TO "seguridad_rol_pkey";
ALTER TABLE "seguridad_rol" RENAME CONSTRAINT "seguridad_roles_creado_por_id_fkey" TO "seguridad_rol_creado_por_id_fkey";
ALTER TABLE "seguridad_rol" RENAME CONSTRAINT "seguridad_roles_actualizado_por_id_fkey" TO "seguridad_rol_actualizado_por_id_fkey";

ALTER TABLE "seguridad_usuario" RENAME CONSTRAINT "seguridad_usuarios_pkey" TO "seguridad_usuario_pkey";
ALTER TABLE "seguridad_usuario" RENAME CONSTRAINT "seguridad_usuarios_rol_id_fkey" TO "seguridad_usuario_rol_id_fkey";
ALTER TABLE "seguridad_usuario" RENAME CONSTRAINT "seguridad_usuarios_creado_por_id_fkey" TO "seguridad_usuario_creado_por_id_fkey";
ALTER TABLE "seguridad_usuario" RENAME CONSTRAINT "seguridad_usuarios_actualizado_por_id_fkey" TO "seguridad_usuario_actualizado_por_id_fkey";

ALTER TABLE "seguridad_grupo_url" RENAME CONSTRAINT "seguridad_grupos_url_pkey" TO "seguridad_grupo_url_pkey";
ALTER TABLE "seguridad_grupo_url" RENAME CONSTRAINT "seguridad_grupos_url_creado_por_id_fkey" TO "seguridad_grupo_url_creado_por_id_fkey";
ALTER TABLE "seguridad_grupo_url" RENAME CONSTRAINT "seguridad_grupos_url_actualizado_por_id_fkey" TO "seguridad_grupo_url_actualizado_por_id_fkey";

ALTER TABLE "seguridad_url" RENAME CONSTRAINT "seguridad_urls_pkey" TO "seguridad_url_pkey";
ALTER TABLE "seguridad_url" RENAME CONSTRAINT "seguridad_urls_grupo_url_id_fkey" TO "seguridad_url_grupo_url_id_fkey";
ALTER TABLE "seguridad_url" RENAME CONSTRAINT "seguridad_urls_creado_por_id_fkey" TO "seguridad_url_creado_por_id_fkey";
ALTER TABLE "seguridad_url" RENAME CONSTRAINT "seguridad_urls_actualizado_por_id_fkey" TO "seguridad_url_actualizado_por_id_fkey";
