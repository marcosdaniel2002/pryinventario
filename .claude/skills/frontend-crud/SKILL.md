---
name: frontend-crud
description: Patron de CRUD del frontend de pryinventario (Next.js) — como armar el formulario, el dialog crear/editar y la tabla de una entidad nueva reusando AutoForm, EntityDialog y createCrudHooks. Usar cuando se agrega o modifica una pantalla de administracion (usuarios, roles, grupos-url, urls, mantenimiento/*) que sigue el patron listar + crear + editar + desactivar.
---

# CRUD de una entidad en el frontend

Building blocks ya armados en `frontend/src/`, no reinventar:

- **`components/shared/auto-form.tsx`** (`AutoForm`) — arma un `<form>` de react-hook-form a partir de un schema de Zod + un array `fields` (name/label/type/placeholder/description/col). El `*` de requerido sale solo de `schema.shape[name].isOptional()` — un `type` de TS no sirve para esto porque desaparece en runtime, por eso el schema de Zod es la fuente de verdad. Layout en grid de 12 columnas estilo Bootstrap (`col` por campo, default 12 = fila completa).
- **`components/shared/entity-dialog.tsx`** (`EntityDialog`) — el shell de Dialog/Header/Footer/error para crear+editar en un solo componente: decide el modo segun si `entity` es `null`, arma `key` por id para resetear el form al cambiar de entidad, combina `isPending` de las dos mutations. Recibe el schema+fields de `AutoForm` mas los mapeos `toFormValues`/`toCreatePayload`/`toUpdatePayload` y las mutations ya instanciadas (`createMutation`/`updateMutation`, ver mas abajo por que ya instanciadas).
- **`lib/create-crud-hooks.ts`** (`createCrudHooks`) — genera `useList/useCreate/useUpdate/useDelete` (TanStack Query) a partir de las funciones de `api.ts`. Soporta `extraInvalidateKeys` para cuando la entidad afecta otra query (ej. grupos-url invalida tambien `["menu"]`, porque alimenta el sidebar).
- **`components/ui/dialog.tsx`** — `<DialogContent size="sm|md|lg|xl|2xl">` (default `"sm"`). `AutoForm` tambien acepta `size` (default `"lg"`) para escalar el gap del grid — pasar el mismo valor a los dos si se cambia.

## Estructura por entidad

Mirror exacto del backend (`features/<dominio>/<entidad>/` ↔ `backend/src/<dominio>/<entidad>/`):

```
features/<dominio>/<entidad>/
├── types.ts        # <Entidad>ListItem — snake_case, igual que el DTO/Prisma
├── schema.ts        # <entidad>FormSchema (zod) + <Entidad>FormValues = z.infer<...>
├── api.ts            # getX/createX/updateX/deleteX via apiFetch, snake_case en el wire
├── hooks.ts           # instancia createCrudHooks(...) y reexporta useX/useCreateX/useUpdateX/useDeleteX
└── components/
    ├── <entidad>-dialog.tsx   # wrapper delgado sobre EntityDialog
    └── <entidad>s-table.tsx    # tabla + estado (crear/editar/eliminar) + ConfirmDeleteDialog
```

Mas la pagina en `app/(administracion)/<dominio>/<entidad>/page.tsx` (auth via `useAuth()`, renderiza `<XsTable token={token} />`).

Referencia completa (copiar de aca, no de memoria): `features/seguridad/grupos-url/` (entidad con varios campos: nombre/path/icono/orden, columnas propias en la tabla) y `features/mantenimiento/categorias/` (entidad minima: solo nombre).

### `hooks.ts` — patron exacto

```ts
"use client";
import { createCrudHooks } from "@/lib/create-crud-hooks";
import { createX, deleteX, getXs, updateX } from "./api";
import type { XListItem } from "./types";

const xHooks = createCrudHooks<
  XListItem,
  Parameters<typeof createX>[1],
  Parameters<typeof updateX>[2]
>({
  queryKey: "xs",
  getAll: getXs,
  create: createX,
  update: updateX,
  delete: deleteX,
});

export const useXs = xHooks.useList;
export const useCreateX = xHooks.useCreate;
export const useUpdateX = xHooks.useUpdate;
export const useDeleteX = xHooks.useDelete;
```

### `<entidad>-dialog.tsx` — patron exacto

Las mutations se instancian ACA (con los hooks de arriba) y se pasan a `EntityDialog` ya creadas — nunca pasar los hooks sin invocar, porque `EntityDialog` no puede llamar un hook condicionalmente adentro sin romper las reglas de hooks.

```tsx
"use client";
import { EntityDialog } from "@/components/shared/entity-dialog";
import { useCreateX, useUpdateX } from "@/features/<dominio>/<entidad>/hooks";
import { xFormSchema, type XFormValues } from "@/features/<dominio>/<entidad>/schema";
import type { XListItem } from "@/features/<dominio>/<entidad>/types";

interface XDialogProps {
  /** null = crear. Con valor = editar ese registro. */
  x: XListItem | null;
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: XFormValues = { nombre: "" /* ...resto de campos */ };

export function XDialog({ x, token, open, onOpenChange }: XDialogProps) {
  const createRegistro = useCreateX(token);
  const updateRegistro = useUpdateX(token);

  return (
    <EntityDialog
      entity={x}
      open={open}
      onOpenChange={onOpenChange}
      token={token}
      schema={xFormSchema}
      fields={[{ name: "nombre", label: "Nombre" } /* ...resto */]}
      getId={(r) => r.id}
      toFormValues={(r) => ({ nombre: r.nombre /* ... */ })}
      emptyValues={emptyValues}
      toCreatePayload={(values) => ({ nombre: values.nombre /* ... */ })}
      toUpdatePayload={(values) => ({ nombre: values.nombre /* ... */ })}
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
```

### `<entidad>s-table.tsx` — patron exacto

La tabla NO es un componente generico parametrizado por `columns` — se escribe a mano por entidad (asi se puede agregar cualquier columna, con cualquier formato, sin pelear con una abstraccion). Lo unico que se reusa es la forma (estado + `ConfirmDeleteDialog` + `RowActionsMenu`), copiando el archivo de referencia y ajustando las columnas de la tabla.

```tsx
"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { ApiError } from "@/lib/api-client";
import { useDeleteX, useXs } from "@/features/<dominio>/<entidad>/hooks";
import type { XListItem } from "@/features/<dominio>/<entidad>/types";
import { XDialog } from "./x-dialog";

export function XsTable({ token }: { token: string | null }) {
  const { data: registros = [], isLoading, isError } = useXs(token);
  const deleteRegistro = useDeleteX(token);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] = useState<XListItem | null>(null);
  const [deletingRegistro, setDeletingRegistro] = useState<XListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreateDialog() {
    setEditingRegistro(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(registro: XListItem) {
    setEditingRegistro(registro);
    setIsDialogOpen(true);
  }

  async function handleConfirmDelete() {
    if (!token || !deletingRegistro) return;
    setDeleteError(null);
    try {
      await deleteRegistro.mutateAsync(deletingRegistro.id);
      setDeletingRegistro(null);
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : "No se pudo desactivar el registro.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Xs</h1>
        <Button onClick={openCreateDialog}>
          <Plus />
          Crear registro
        </Button>
      </div>
      {/* tabla: <thead>/<tbody> con las columnas propias de X, mapeando registros */}
      <XDialog x={editingRegistro} token={token} open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      <ConfirmDeleteDialog
        open={deletingRegistro !== null}
        onOpenChange={(open) => { if (!open) setDeletingRegistro(null); }}
        title="Desactivar registro"
        description={deleteError ?? "Esta acción desactivará este registro. Podrás reactivarlo más adelante."}
        isDeleting={deleteRegistro.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
```

## Convencion de nombres: especifico afuera, "Registro" adentro

Esto es lo que distingue este patron y hay que respetarlo siempre:

- **Quedan especificos de la entidad** (porque son la API publica / lo que conecta con imports de otros archivos): nombre del componente (`XDialog`, `XsTable`), el tipo (`XListItem`), los hooks (`useXs`, `useCreateX`, ...), el nombre del prop de la entidad en el dialog (`x`, no `entity` ni `registro`).
- **Pasan a ser genericos ("registro"/"Registro")**: variables locales dentro de las funciones (`createRegistro`, `updateRegistro`, `deleteRegistro`, `editingRegistro`, `deletingRegistro`, `registros`, `registro` como nombre de variable de loop) y **todo el texto de UI de las acciones** — "Crear registro", "Editar registro", "Desactivar registro", los mensajes de error ("No se pudo crear/guardar/desactivar el registro").
- **Quedan especificos** el `<h1>` de la tabla (ej. "Grupos de URL", "Categorías") y las columnas propias de esa entidad (ej. "Path", "URLs hijas") — eso no es boilerplate generico, es informacion real de la entidad.

Por que: evita 1) repetir el nombre de la entidad seis veces en el mismo archivo, y 2) el problema de genero en español (categoría es femenino, registro/rol/marca son masculinos) — "registro" como palabra generica no fuerza a acertar el articulo correcto para cada entidad nueva.

## Que NO hacer

Se probo (y se descartó) armar un componente super-generico tipo `SimpleRegistroTable`/`SimpleRegistroDialog` que reciba `columns`/`label` como props y renderice TODO (tabla + dialog + estado) para cualquier entidad con forma "solo nombre". Se sacó porque:
- Fuerza una forma de tabla fija (aunque sea configurable via `columns`) en vez de dejar escribir el JSX a mano.
- La ganancia real de líneas era chica comparada con la fricción de una abstracción extra para entender/debuggear.

Si una entidad nueva es igual de simple que `categorias` (solo `nombre`), **copiar** `categoria-dialog.tsx`/`categorias-table.tsx` como plantilla y renombrar — no crear un componente compartido para evitar ese copy-paste. El nivel correcto de reuso en este proyecto es `AutoForm` + `EntityDialog` + `createCrudHooks` (los tres genéricos y ya construidos), no una capa mas arriba de esos tres.
