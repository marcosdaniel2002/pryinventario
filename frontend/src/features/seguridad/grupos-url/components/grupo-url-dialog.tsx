"use client";

import { EntityDialog } from "@/components/shared/entity-dialog";
import {
  useCreateGrupoUrl,
  useUpdateGrupoUrl,
} from "@/features/seguridad/grupos-url/hooks";
import {
  grupoUrlFormSchema,
  type GrupoUrlFormValues,
} from "@/features/seguridad/grupos-url/schema";
import type { GrupoUrlListItem } from "@/features/seguridad/grupos-url/types";

interface GrupoUrlDialogProps {
  /** null = crear un grupo nuevo. Con valor = editar ese grupo. */
  grupo: GrupoUrlListItem | null;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: GrupoUrlFormValues = {
  nombre: "",
  path: "",
  icono: "",
  orden: 0,
};

export function GrupoUrlDialog({
  grupo,
  token,
  open,
  onOpenChange,
}: GrupoUrlDialogProps) {
  const createRegistro = useCreateGrupoUrl(token);
  const updateRegistro = useUpdateGrupoUrl(token);

  return (
    <EntityDialog
      entity={grupo}
      open={open}
      onOpenChange={onOpenChange}
      token={token}
      schema={grupoUrlFormSchema}
      fields={[
        { name: "nombre", label: "Nombre" },
        { name: "path", label: "Path" },
        {
          name: "icono",
          label: "Icono",
          col: 6,
          description:
            'Nombre del ícono de lucide.dev, en minúsculas (ej. "settings", "shield-check").',
        },
        { name: "orden", label: "Orden", type: "number", col: 6 },
      ]}
      getId={(g) => g.id}
      toFormValues={(g) => ({
        nombre: g.nombre,
        path: g.path,
        icono: g.icono ?? "",
        orden: g.orden,
      })}
      emptyValues={emptyValues}
      toCreatePayload={(values: GrupoUrlFormValues) => ({
        nombre: values.nombre,
        path: values.path,
        orden: values.orden,
        ...(values.icono?.trim() ? { icono: values.icono.trim() } : {}),
      })}
      toUpdatePayload={(values: GrupoUrlFormValues) => ({
        nombre: values.nombre,
        path: values.path,
        icono: values.icono ?? "",
        orden: values.orden,
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
