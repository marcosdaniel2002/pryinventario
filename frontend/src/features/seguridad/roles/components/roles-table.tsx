"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { ApiError } from "@/lib/api-client";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { useGruposUrl } from "@/features/seguridad/grupos-url/hooks";
import { useUrls } from "@/features/seguridad/urls/hooks";
import {
  useDeleteRol,
  useRolesPaginated,
} from "@/features/seguridad/roles/hooks";
import type { RolListItem } from "@/features/seguridad/roles/types";

import { CreateRolDialog } from "./create-rol-dialog";
import { EditRolDialog } from "./edit-rol-dialog";

export function RolesTable({ token }: { token: string | null }) {
  const [page, setPage] = useState(1);
  const { data: response, isLoading, isError } = useRolesPaginated(
    token,
    page,
    DEFAULT_PAGE_SIZE,
  );
  const roles = response?.data ?? [];
  const total = response?.total ?? 0;
  const { data: grupos = [] } = useGruposUrl(token);
  const { data: urls = [] } = useUrls(token);
  const deleteRol = useDeleteRol(token);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<RolListItem | null>(null);
  const [deletingRol, setDeletingRol] = useState<RolListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    if (!token || !deletingRol) return;

    setDeleteError(null);

    try {
      await deleteRol.mutateAsync(deletingRol.id);
      setDeletingRol(null);
    } catch (err) {
      setDeleteError(
        err instanceof ApiError ? err.message : "No se pudo desactivar el rol."
      );
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Roles
        </h1>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus />
          Crear rol
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : null}
      {isError ? (
        <p className="text-sm text-destructive">
          No se pudieron cargar los roles.
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
                <th className="px-4 py-2 font-medium text-foreground">
                  Descripción
                </th>
                <th className="px-4 py-2 font-medium text-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-6 text-center text-muted-foreground"
                  >
                    Sin registros.
                  </td>
                </tr>
              ) : (
                roles.map((rol) => (
                  <tr
                    key={rol.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <td className="px-4 py-2 text-foreground">{rol.nombre}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {rol.descripcion ?? "-"}
                    </td>
                    <td className="px-4 py-2">
                      <RowActionsMenu
                        onEdit={() => setEditingRol(rol)}
                        onDelete={() => {
                          setDeleteError(null);
                          setDeletingRol(rol);
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

      <CreateRolDialog
        grupos={grupos}
        urls={urls}
        token={token}
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <EditRolDialog
        rol={editingRol}
        grupos={grupos}
        urls={urls}
        token={token}
        open={editingRol !== null}
        onOpenChange={(open) => {
          if (!open) setEditingRol(null);
        }}
      />

      <ConfirmDeleteDialog
        open={deletingRol !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingRol(null);
        }}
        title="Desactivar rol"
        description={
          deleteError ??
          "Esta acción desactivará este rol. Los usuarios que aún lo tengan asignado seguirán referenciándolo, así que revisa antes de continuar. Podrás reactivarlo más adelante."
        }
        isDeleting={deleteRol.isPending}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
