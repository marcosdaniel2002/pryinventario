"use client";

import { useId, useState } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { DefaultValues } from "react-hook-form";
import type { z, ZodObject, ZodRawShape } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  type DialogSize,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  AutoForm,
  type AutoFormField,
  type AutoFormFileField,
  type AutoFormFileValue,
} from "@/components/shared/auto-form";
import { ApiError } from "@/lib/api-client";
import { appendFormData } from "@/lib/form-data";

/**
 * Dialog generico de crear/editar para cualquier entidad: decide el modo
 * segun si `entity` es null, arma el shell (Dialog/Header/Footer/error) y
 * delega los campos a <AutoForm>. Cada entidad solo escribe un wrapper
 * delgado con su schema, fields y el mapeo hacia los payloads del backend
 * (ver GrupoUrlDialog para el ejemplo de referencia, o ProductoDialog para
 * uno que además sube fotos con `fileFields`).
 *
 * Arma un `FormData` a partir de `toCreatePayload`/`toUpdatePayload` (+ los
 * archivos de `fileFields`, si la entidad tiene) y lo manda tal cual a las
 * mutations — todo el proyecto habla multipart/form-data con el backend,
 * tenga o no campos de archivo la entidad.
 */

interface FileFieldSpec<TEntity> extends AutoFormFileField {
  /** URL actual del archivo de esta entidad para este campo (o null si no tiene). */
  getCurrentUrl: (entity: TEntity) => string | null;
  /** Nombre del campo del FormData para el archivo. Default: el mismo `name`. */
  fileFieldName?: string;
  /** Nombre del campo del FormData para la bandera "sacar el archivo actual" (solo al editar). Default: `${name}_eliminar`. */
  removeFieldName?: string;
}

interface EntityDialogProps<
  TEntity,
  Shape extends ZodRawShape,
  TCreatePayload extends Record<string, unknown>,
  TUpdatePayload extends Record<string, unknown>,
> {
  entity: TEntity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: string | null;

  schema: ZodObject<Shape>;
  fields: AutoFormField<Shape>[];
  fileFields?: FileFieldSpec<TEntity>[];
  size?: DialogSize;

  getId: (entity: TEntity) => string;
  toFormValues: (entity: TEntity) => DefaultValues<z.infer<ZodObject<Shape>>>;
  emptyValues: DefaultValues<z.infer<ZodObject<Shape>>>;
  toCreatePayload: (values: z.infer<ZodObject<Shape>>) => TCreatePayload;
  toUpdatePayload: (values: z.infer<ZodObject<Shape>>) => TUpdatePayload;

  createMutation: UseMutationResult<TEntity, Error, FormData>;
  updateMutation: UseMutationResult<TEntity, Error, { id: string; data: FormData }>;

  titleCreate: string;
  titleEdit: string;
  descriptionCreate: string;
  descriptionEdit: string;
  errorCreate?: string;
  errorEdit?: string;
}

export function EntityDialog<
  TEntity,
  Shape extends ZodRawShape,
  TCreatePayload extends Record<string, unknown>,
  TUpdatePayload extends Record<string, unknown>,
>({
  entity,
  open,
  onOpenChange,
  token,
  schema,
  fields,
  fileFields = [],
  size = "lg",
  getId,
  toFormValues,
  emptyValues,
  toCreatePayload,
  toUpdatePayload,
  createMutation,
  updateMutation,
  titleCreate,
  titleEdit,
  descriptionCreate,
  descriptionEdit,
  errorCreate = "No se pudo crear el registro.",
  errorEdit = "No se pudo guardar el registro.",
}: EntityDialogProps<TEntity, Shape, TCreatePayload, TUpdatePayload>) {
  const isEditing = entity !== null;
  const [error, setError] = useState<string | null>(null);
  const isPending = createMutation.isPending || updateMutation.isPending;
  const formId = useId();

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) setError(null);
    onOpenChange(nextOpen);
  }

  async function handleSubmit(
    values: z.infer<ZodObject<Shape>>,
    files: Record<string, AutoFormFileValue>,
  ) {
    if (!token) return;
    setError(null);

    const formData = new FormData();
    appendFormData(
      formData,
      entity ? toUpdatePayload(values) : toCreatePayload(values),
    );

    for (const fileField of fileFields) {
      const fileValue = files[fileField.name];
      if (fileValue?.file) {
        formData.append(fileField.fileFieldName ?? fileField.name, fileValue.file);
      } else if (isEditing && fileValue?.remove) {
        formData.append(
          fileField.removeFieldName ?? `${fileField.name}_eliminar`,
          "true",
        );
      }
    }

    try {
      if (entity) {
        await updateMutation.mutateAsync({ id: getId(entity), data: formData });
      } else {
        await createMutation.mutateAsync(formData);
      }
      handleOpenChange(false);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : isEditing
            ? errorEdit
            : errorCreate,
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent size={size}>
        <DialogHeader>
          <DialogTitle>{isEditing ? titleEdit : titleCreate}</DialogTitle>
          <DialogDescription>
            {isEditing ? descriptionEdit : descriptionCreate}
          </DialogDescription>
        </DialogHeader>

        <AutoForm
          key={entity ? getId(entity) : "create"}
          id={formId}
          size={size}
          schema={schema}
          fields={fields}
          fileFields={fileFields}
          defaultValues={entity ? toFormValues(entity) : emptyValues}
          currentFileUrls={
            entity
              ? Object.fromEntries(
                  fileFields.map((f) => [f.name, f.getCurrentUrl(entity)]),
                )
              : {}
          }
          onSubmit={handleSubmit}
        />

        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        <DialogFooter showCloseButton>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? "Guardando..." : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
