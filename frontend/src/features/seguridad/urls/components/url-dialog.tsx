"use client";

import { EntityDialog } from "@/components/shared/entity-dialog";
import { useCreateUrl, useUpdateUrl } from "@/features/seguridad/urls/hooks";
import { urlFormSchema, type UrlFormValues } from "@/features/seguridad/urls/schema";
import type { UrlListItem } from "@/features/seguridad/urls/types";
import type { GrupoUrlListItem } from "@/features/seguridad/grupos-url/types";

interface UrlDialogProps {
  /** null = crear una url nueva. Con valor = editar esa url. */
  url: UrlListItem | null;
  grupos: GrupoUrlListItem[];
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: UrlFormValues = {
  nombre: "",
  path: "",
  icono: "",
  orden: 0,
  grupo_url_id: "",
};

export function UrlDialog({
  url,
  grupos,
  token,
  open,
  onOpenChange,
}: UrlDialogProps) {
  const createRegistro = useCreateUrl(token);
  const updateRegistro = useUpdateUrl(token);

  return (
    <EntityDialog
      entity={url}
      open={open}
      onOpenChange={onOpenChange}
      token={token}
      schema={urlFormSchema}
      fields={[
        { name: "nombre", label: "Nombre" },
        { name: "path", label: "Path" },
        { name: "icono", label: "Icono", col: 6 },
        { name: "orden", label: "Orden", type: "number", col: 6 },
        {
          name: "grupo_url_id",
          label: "Grupo",
          type: "combobox",
          placeholder: "Selecciona un grupo",
          options: grupos.map((grupo) => ({
            value: grupo.id,
            label: grupo.nombre,
          })),
        },
      ]}
      getId={(u) => u.id}
      toFormValues={(u) => ({
        nombre: u.nombre,
        path: u.path,
        icono: u.icono ?? "",
        orden: u.orden,
        grupo_url_id: u.grupo_url_id,
      })}
      emptyValues={emptyValues}
      toCreatePayload={(values: UrlFormValues) => ({
        nombre: values.nombre,
        path: values.path,
        orden: values.orden,
        grupo_url_id: values.grupo_url_id,
        ...(values.icono?.trim() ? { icono: values.icono.trim() } : {}),
      })}
      toUpdatePayload={(values: UrlFormValues) => ({
        nombre: values.nombre,
        path: values.path,
        icono: values.icono ?? "",
        orden: values.orden,
        grupo_url_id: values.grupo_url_id,
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
