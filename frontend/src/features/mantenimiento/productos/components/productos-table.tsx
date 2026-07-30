"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { RowActionsMenu } from "@/components/shared/row-actions-menu";
import { ApiError } from "@/lib/api-client";
import { mediaUrl } from "@/lib/media-url";
import { DEFAULT_PAGE_SIZE } from "@/lib/pagination";
import { useCategorias } from "@/features/mantenimiento/categorias/hooks";
import { useMarcas } from "@/features/mantenimiento/marcas/hooks";
import {
  useDeleteProducto,
  useProductosPaginated,
} from "@/features/mantenimiento/productos/hooks";
import type { ProductoListItem } from "@/features/mantenimiento/productos/types";
import { ProductoDialog } from "./producto-dialog";
import { ProductosFilters } from "./productos-filters";

const currencyFormatter = new Intl.NumberFormat("es-EC", {
  style: "currency",
  currency: "USD",
});

function FotoThumb({ foto }: { foto: string | null }) {
  if (!foto) return <div className="size-10 rounded bg-muted" />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- viene de otro origen (backend), no de /public
    <img src={mediaUrl(foto)!} alt="" className="size-10 rounded object-cover" />
  );
}

export function ProductosTable({ token }: { token: string | null }) {
  const searchParams = useSearchParams();
  const criterio = searchParams.get("criterio") ?? "";
  const categoriaId = searchParams.get("categoria_id") ?? "";
  const marcaId = searchParams.get("marca_id") ?? "";

  const [page, setPage] = useState(1);

  // Un filtro nuevo reinicia la paginación — si no, se podría quedar en una
  // página que ya no existe para el resultado filtrado.
  useEffect(() => {
    setPage(1);
  }, [criterio, categoriaId, marcaId]);

  const { data: response, isLoading, isError } = useProductosPaginated(
    token,
    page,
    DEFAULT_PAGE_SIZE,
    {
      criterio: criterio || undefined,
      categoria_id: categoriaId || undefined,
      marca_id: marcaId || undefined,
    },
  );
  const registros = response?.data ?? [];
  const total = response?.total ?? 0;
  const { data: categorias = [] } = useCategorias(token);
  const { data: marcas = [] } = useMarcas(token);
  const deleteRegistro = useDeleteProducto(token);

  const categoriaNombreById = new Map(categorias.map((c) => [c.id, c.nombre]));
  const marcaNombreById = new Map(marcas.map((m) => [m.id, m.nombre]));

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegistro, setEditingRegistro] =
    useState<ProductoListItem | null>(null);
  const [deletingRegistro, setDeletingRegistro] =
    useState<ProductoListItem | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreateDialog() {
    setEditingRegistro(null);
    setIsDialogOpen(true);
  }

  function openEditDialog(registro: ProductoListItem) {
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
          Productos
        </h1>
        <Button onClick={openCreateDialog}>
          <Plus />
          Crear registro
        </Button>
      </div>

      <ProductosFilters categorias={categorias} marcas={marcas} />

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
                  Foto
                </th>
                <th className="px-4 py-2 font-medium text-foreground">
                  Foto 2
                </th>
                <th className="px-4 py-2 font-medium text-foreground">
                  Código
                </th>
                <th className="px-4 py-2 font-medium text-foreground">
                  Nombre
                </th>
                <th className="px-4 py-2 font-medium text-foreground">
                  Categoría
                </th>
                <th className="px-4 py-2 font-medium text-foreground">
                  Marca
                </th>
                <th className="px-4 py-2 font-medium text-foreground">
                  Costo
                </th>
                <th className="px-4 py-2 font-medium text-foreground">PVP</th>
                <th className="px-4 py-2 font-medium text-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
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
                    <td className="px-4 py-2">
                      <FotoThumb foto={registro.foto} />
                    </td>
                    <td className="px-4 py-2">
                      <FotoThumb foto={registro.foto_2} />
                    </td>
                    <td className="px-4 py-2 text-foreground">
                      {registro.codigo}
                    </td>
                    <td className="px-4 py-2 text-foreground">
                      {registro.nombre}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {registro.categoria_id
                        ? categoriaNombreById.get(registro.categoria_id) ?? "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {registro.marca_id
                        ? marcaNombreById.get(registro.marca_id) ?? "—"
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {currencyFormatter.format(registro.costo)}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {currencyFormatter.format(registro.pvp)}
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

      <ProductoDialog
        producto={editingRegistro}
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
