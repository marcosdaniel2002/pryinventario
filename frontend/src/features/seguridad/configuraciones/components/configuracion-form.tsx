"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AutoForm, type AutoFormFileValue } from "@/components/shared/auto-form";
import { ApiError } from "@/lib/api-client";
import { appendFormData } from "@/lib/form-data";
import { mediaUrl } from "@/lib/media-url";
import { useConfiguracion } from "@/providers/configuracion-provider";
import {
  useCreateConfiguracion,
  useUpdateConfiguracion,
} from "@/features/seguridad/configuraciones/hooks";
import {
  configuracionFormSchema,
  type ConfiguracionFormValues,
} from "@/features/seguridad/configuraciones/schema";

/**
 * Configuracion es un singleton: no hay listado ni dialog crear/editar,
 * solo este form directo en la página — reusa <AutoForm> tal cual (mismo
 * building block que EntityDialog usa adentro del modal) y arma el
 * FormData/decide create-vs-update acá, sin la parte de Dialog/Header/
 * Footer que no aplica cuando no hay un modal.
 */

const emptyValues: ConfiguracionFormValues = {
  nombre: "",
  descripcion: "",
  celular: "",
  correo: "",
};

const FORM_ID = "configuracion-form";

export function ConfiguracionForm({ token }: { token: string | null }) {
  const { configuracion, isLoading, isError } = useConfiguracion();

  const createRegistro = useCreateConfiguracion(token);
  const updateRegistro = useUpdateConfiguracion(token);
  const isPending = createRegistro.isPending || updateRegistro.isPending;

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(
    values: ConfiguracionFormValues,
    files: Record<string, AutoFormFileValue>,
  ) {
    if (!token) return;
    setError(null);
    setSaved(false);

    const formData = new FormData();
    appendFormData(formData, {
      nombre: values.nombre,
      ...(values.descripcion?.trim() ? { descripcion: values.descripcion.trim() } : {}),
      ...(values.celular?.trim() ? { celular: values.celular.trim() } : {}),
      ...(values.correo?.trim() ? { correo: values.correo.trim() } : {}),
    });

    const icono = files.icono;
    if (icono?.file) {
      formData.append("icono", icono.file);
    } else if (configuracion && icono?.remove) {
      formData.append("icono_eliminar", "true");
    }

    try {
      if (configuracion) {
        await updateRegistro.mutateAsync({ id: configuracion.id, data: formData });
      } else {
        await createRegistro.mutateAsync(formData);
      }
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "No se pudo guardar la configuración.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold tracking-tight text-foreground">
        Configuración
      </h1>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : null}
      {isError ? (
        <p className="text-sm text-destructive">
          No se pudo cargar la configuración.
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <>
          <AutoForm
            key={configuracion?.id ?? "create"}
            id={FORM_ID}
            schema={configuracionFormSchema}
            fields={[
              { name: "nombre", label: "Nombre", col: 4 },
              { name: "correo", label: "Correo", col: 4 },
              { name: "celular", label: "Celular", col: 4 },
              { name: "descripcion", label: "Descripción" },
            ]}
            fileFields={[{ name: "icono", label: "Ícono" }]}
            currentFileUrls={{ icono: mediaUrl(configuracion?.icono) }}
            defaultValues={
              configuracion
                ? {
                    nombre: configuracion.nombre,
                    descripcion: configuracion.descripcion ?? "",
                    celular: configuracion.celular ?? "",
                    correo: configuracion.correo ?? "",
                  }
                : emptyValues
            }
            onSubmit={handleSubmit}
          />

          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          {saved ? (
            <p className="text-xs text-muted-foreground">
              Configuración guardada.
            </p>
          ) : null}

          <div>
            <Button type="submit" form={FORM_ID} disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
