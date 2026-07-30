/*
  Warnings:

  - Added the required column `actualizado_en` to the `mantenimiento_categoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creado_por_id` to the `mantenimiento_categoria` table without a default value. This is not possible if the table is not empty.
  - Added the required column `actualizado_en` to the `mantenimiento_marca` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creado_por_id` to the `mantenimiento_marca` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "mantenimiento_categoria" ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "actualizado_por_id" TEXT,
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creado_por_id" TEXT NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "mantenimiento_marca" ADD COLUMN     "actualizado_en" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "actualizado_por_id" TEXT,
ADD COLUMN     "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "creado_por_id" TEXT NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- AddForeignKey
ALTER TABLE "mantenimiento_categoria" ADD CONSTRAINT "mantenimiento_categoria_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "seguridad_usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimiento_categoria" ADD CONSTRAINT "mantenimiento_categoria_actualizado_por_id_fkey" FOREIGN KEY ("actualizado_por_id") REFERENCES "seguridad_usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimiento_marca" ADD CONSTRAINT "mantenimiento_marca_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "seguridad_usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimiento_marca" ADD CONSTRAINT "mantenimiento_marca_actualizado_por_id_fkey" FOREIGN KEY ("actualizado_por_id") REFERENCES "seguridad_usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
