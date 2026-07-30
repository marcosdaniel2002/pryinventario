"use client";

import { EntityDialog } from "@/components/shared/entity-dialog";
import { mediaUrl } from "@/lib/media-url";
import { useCategorias } from "@/features/mantenimiento/categorias/hooks";
import { useMarcas } from "@/features/mantenimiento/marcas/hooks";
import {
  useCreateProducto,
  useUpdateProducto,
} from "@/features/mantenimiento/productos/hooks";
import {
  productoFormSchema,
  type ProductoFormValues,
} from "@/features/mantenimiento/productos/schema";
import type { ProductoListItem } from "@/features/mantenimiento/productos/types";

interface ProductoDialogProps {
  /** null = crear un producto nuevo. Con valor = editar ese producto. */
  producto: ProductoListItem | null;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: ProductoFormValues = {
  codigo: "",
  nombre: "",
  descripcion: "",
  costo: 0,
  porcentaje_iva: 0,
  pvp: 0,
  categoria_id: "",
  marca_id: "",
};

export function ProductoDialog({
  producto,
  token,
  open,
  onOpenChange,
}: ProductoDialogProps) {
  const createRegistro = useCreateProducto(token);
  const updateRegistro = useUpdateProducto(token);
  const { data: categorias = [] } = useCategorias(token);
  const { data: marcas = [] } = useMarcas(token);

  return (
    <EntityDialog
      entity={producto}
      open={open}
      onOpenChange={onOpenChange}
      token={token}
      schema={productoFormSchema}
      size="xl"
      fields={[
        { name: "codigo", label: "Código", col: 6 },
        { name: "nombre", label: "Nombre", col: 6 },
        { name: "descripcion", label: "Descripción" },
        { name: "costo", label: "Costo", type: "number", col: 4 },
        {
          name: "porcentaje_iva",
          label: "Porcentaje IVA",
          type: "number",
          col: 4,
        },
        { name: "pvp", label: "PVP", type: "number", col: 4 },
        {
          name: "categoria_id",
          label: "Categoría",
          type: "combobox",
          col: 6,
          options: categorias.map((c) => ({ value: c.id, label: c.nombre })),
        },
        {
          name: "marca_id",
          label: "Marca",
          type: "combobox",
          col: 6,
          options: marcas.map((m) => ({ value: m.id, label: m.nombre })),
        },
      ]}
      fileFields={[
        {
          name: "foto",
          label: "Foto",
          col: 6,
          getCurrentUrl: (p) => mediaUrl(p.foto),
        },
        {
          name: "foto_2",
          label: "Foto 2",
          col: 6,
          getCurrentUrl: (p) => mediaUrl(p.foto_2),
        },
      ]}
      getId={(p) => p.id}
      toFormValues={(p) => ({
        codigo: p.codigo,
        nombre: p.nombre,
        descripcion: p.descripcion ?? "",
        costo: p.costo,
        porcentaje_iva: p.porcentaje_iva,
        pvp: p.pvp,
        categoria_id: p.categoria_id ?? "",
        marca_id: p.marca_id ?? "",
      })}
      emptyValues={emptyValues}
      toCreatePayload={(values: ProductoFormValues) => ({
        codigo: values.codigo,
        nombre: values.nombre,
        costo: values.costo,
        porcentaje_iva: values.porcentaje_iva,
        pvp: values.pvp,
        ...(values.descripcion?.trim()
          ? { descripcion: values.descripcion.trim() }
          : {}),
        ...(values.categoria_id ? { categoria_id: values.categoria_id } : {}),
        ...(values.marca_id ? { marca_id: values.marca_id } : {}),
      })}
      toUpdatePayload={(values: ProductoFormValues) => ({
        codigo: values.codigo,
        nombre: values.nombre,
        descripcion: values.descripcion?.trim() ?? "",
        costo: values.costo,
        porcentaje_iva: values.porcentaje_iva,
        pvp: values.pvp,
        // categoria_id/marca_id son FK: solo se mandan con valor, nunca "",
        // porque "" rompe la relación (no matchea ningún id existente).
        ...(values.categoria_id ? { categoria_id: values.categoria_id } : {}),
        ...(values.marca_id ? { marca_id: values.marca_id } : {}),
      })}
      createMutation={createRegistro}
      updateMutation={updateRegistro}
      titleCreate="Crear registro"
      titleEdit="Editar registro"
      descriptionCreate="Completa los datos del nuevo registro."
      descriptionEdit="Actualiza los datos del registro y guarda los cambios."
      errorCreate="No se pudo crear el registro."
      errorEdit="No se pudo guardar el registro."
    />
  );
}
