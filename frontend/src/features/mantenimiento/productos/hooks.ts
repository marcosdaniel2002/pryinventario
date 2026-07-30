"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { createCrudHooks } from "@/lib/create-crud-hooks";

import {
  createProducto,
  deleteProducto,
  getProductos,
  getProductosPaginated,
  updateProducto,
  type ProductosFilters,
} from "./api";
import type { ProductoListItem } from "./types";

const productosHooks = createCrudHooks<
  ProductoListItem,
  Parameters<typeof createProducto>[1],
  Parameters<typeof updateProducto>[2]
>({
  queryKey: "productos",
  getAll: getProductos,
  create: createProducto,
  update: updateProducto,
  delete: deleteProducto,
});

export const useProductos = productosHooks.useList;
export const useCreateProducto = productosHooks.useCreate;
export const useUpdateProducto = productosHooks.useUpdate;
export const useDeleteProducto = productosHooks.useDelete;

/**
 * No usa el `useListPaginated` genérico de la fábrica: Productos necesita
 * filtros (criterio/categoria_id/marca_id) además de page/limit, algo que
 * el resto de las entidades paginadas todavía no necesita.
 */
export function useProductosPaginated(
  token: string | null,
  page: number,
  limit: number,
  filters: ProductosFilters = {},
) {
  return useQuery({
    queryKey: ["productos", "paginated", page, limit, filters],
    queryFn: () => getProductosPaginated(token!, { page, limit, ...filters }),
    enabled: !!token,
    placeholderData: keepPreviousData,
  });
}
