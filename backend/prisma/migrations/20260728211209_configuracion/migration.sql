-- CreateTable
CREATE TABLE "seguridad_configuracion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "icono" TEXT,
    "celular" TEXT,
    "correo" TEXT,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizado_en" TIMESTAMP(3) NOT NULL,
    "creado_por_id" TEXT NOT NULL,
    "actualizado_por_id" TEXT,

    CONSTRAINT "seguridad_configuracion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "seguridad_configuracion" ADD CONSTRAINT "seguridad_configuracion_creado_por_id_fkey" FOREIGN KEY ("creado_por_id") REFERENCES "seguridad_usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguridad_configuracion" ADD CONSTRAINT "seguridad_configuracion_actualizado_por_id_fkey" FOREIGN KEY ("actualizado_por_id") REFERENCES "seguridad_usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;
