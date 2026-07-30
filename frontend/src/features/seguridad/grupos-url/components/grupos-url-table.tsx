"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { ApiError } from "@/lib/api-client";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import {
  useDeleteGrupoUrl,
  useGruposUrlPaginated,
} from "@/features/seguridad/grupos-url/hooks";
import type { GrupoUrlListItem } from "@/features/seguridad/grupos-url/types";
import { GrupoUrlDialog } from "./grupo-url-dialog";

export function GruposUrlTable({ token }: { token: string | null }) {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isError } = useGruposUrlPaginated(
    token,
    page,
    DEFAULT_PAGE_SIZE,
  );
  const registros = response?.data ?? [];
  const total = response?.total ?? 0;
  const deleteRegistro = useDeleteGrupoUrl(token);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] =
    useState<GrupoUrlListItem | null>(null);
  const [deletingRegistro, setDeletingRegistro] =
    useState<GrupoUrlListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreateDialog() {
    setEditingRegistro(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(registro: GrupoUrlListItem) {
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
      setDeleteError(
        err instanceof ApiError
          ? err.message
          : "No se pudo desactivar el registro.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Grupos de URL
        </h1>
        <Button onClick={openCreateDialog}>
          <Plus />
          Crear registro
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : null}
      {isError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los registros.
        </p>
      ) : null}

      {!isLoading && !isError ? (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-2 font-medium text-foreground">
                  Nombre
                </th>
                <th className="px-4 py-2 font-medium text-foreground">Path</th>
                <th className="px-4 py-2 font-medium text-foreground">
                  URLs hijas
                </th>
                <th className="px-4 py-2 font-medium text-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    Sin registros.
                  </td>
                </tr>
              ) : (
                registros.map((registro) => (
                  <tr
                    key={registro.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-2 text-foreground">
                      {registro.nombre}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {registro.path}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {registro.urls.length}
                    </td>
                    <td className="px-4 py-2">
                      <RowActionsMenu
                        onEdit={() => openEditDialog(registro)}
                        onDelete={() => {
                          setDeleteError(null);
                          setDeletingRegistro(registro);
                        }}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : null}

      {!isLoading && !isError ? (
        <PaginationControls
          page={page}
          limit={DEFAULT_PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      ) : null}

      <GrupoUrlDialog
        grupo={editingRegistro}
        token={token}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />

      <ConfirmDeleteDialog
        open={deletingRegistro !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingRegistro(null);
        }}
        title="Desactivar registro"
        description={
          deleteError ??
          "Esta acción desactivará este registro. Podrás reactivarlo más adelante."
        }
        isDeleting={deleteRegistro.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
