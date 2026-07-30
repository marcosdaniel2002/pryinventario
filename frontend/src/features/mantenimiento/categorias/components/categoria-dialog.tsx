"use client";

import { EntityDialog } from "@/components/shared/entity-dialog";
import {
  useCreateCategoria,
  useUpdateCategoria,
} from "@/features/mantenimiento/categorias/hooks";
import {
  categoriaFormSchema,
  type CategoriaFormValues,
} from "@/features/mantenimiento/categorias/schema";
import type { CategoriaListItem } from "@/features/mantenimiento/categorias/types";

interface CategoriaDialogProps {
  /** null = crear una categoría nueva. Con valor = editar esa categoría. */
  categoria: CategoriaListItem | null;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: CategoriaFormValues = {
  nombre: "",
};

export function CategoriaDialog({
  categoria,
  token,
  open,
  onOpenChange,
}: CategoriaDialogProps) {
  const createRegistro = useCreateCategoria(token);
  const updateRegistro = useUpdateCategoria(token);

  return (
    <EntityDialog
      entity={categoria}
      open={open}
      onOpenChange={onOpenChange}
      token={token}
      schema={categoriaFormSchema}
      fields={[{ name: "nombre", label: "Nombre" }]}
      size="sm"
      getId={(c) => c.id}
      toFormValues={(c) => ({
        nombre: c.nombre,
      })}
      emptyValues={emptyValues}
      toCreatePayload={(values: CategoriaFormValues) => ({
        nombre: values.nombre,
      })}
      toUpdatePayload={(values: CategoriaFormValues) => ({
        nombre: values.nombre,
      })}
      createMutation={createRegistro}
      updateMutation={updateRegistro}
      titleCreate={`Crear registro`}
      titleEdit={`Editar registro`}
      descriptionCreate={`Completa los datos del nuevo registro.`}
      descriptionEdit={`Actualiza los datos del registro y guarda los cambios.`}
      errorCreate={`No se pudo crear el registro.`}
      errorEdit={`No se pudo guardar el registro.`}
    />
  );
}
